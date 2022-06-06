'use strict';


let helper = require("../helpers/helpers"),
    md5 = require('md5'),
    SEND_SMS = require("../helpers/send_sms"),
    SEND_EMAIL = require("../helpers/send_email"),
    CountryModel = require("../models/Country"),
    // FAQModel = require("../models/faqs"),
    WalletClaimsModel = require("../models/Wallet_claims"),
    UserModel = require("../models/Users"),
    TermsConditionModel = require("../models/TermsCondition"),
    UserAuthModel = require("../models/Users_auth"),
    WalletModel  =  require("../models/Wallet"),
    TransactionalOTPModel = require("../models/Transactional_otp"),
    BalanceLogModel = require("../models/Balance_log"),
    CommonHelper = require('../helpers/helpers'),
    NotificationHelper = require("../helpers/notifications"),
    config = process.config.global_config,
    s3Helper = require('../helpers/awsS3Helper'),
    StripeFunc = require("../manager/Stripe"),
    fs = require('fs'),
    axios = require('axios'),
    util = require('util'),
    unlinkFile = util.promisify(fs.unlink),
    BadRequestError = require('../errors/badRequestError');
const { v4: uuidv4 } = require('uuid');


let sendOtpForRegistration = async (req) => {
    let body = req.body
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }
    ['name', 'username', 'phone', 'region', 'password', 'gender'].forEach(x => {
        if (!body[x]) {
            throw new BadRequestError(req.t(x) + req.t("is_required"));
        }
    });
    let user = await UserModel
        .findOne({ where: { username: body.username.trim() }, attributes: ['id', 'phone'] });

    if (user) {
        throw new BadRequestError(req.t("user_exist"));
    }
    user = await UserModel
        .findOne({ where: { phone: body.phone.trim() }, attributes: ['id', 'phone'] });

    if (user) {
        throw new BadRequestError(req.t("phone_exist"));
    }
    if (body.email) {
        user = await UserModel
            .findOne({ where: { email: body.email.trim() }, attributes: ['id', 'phone'] });

        if (user) {
            throw new BadRequestError(req.t("email_exist"));
        }
    }
    try {
        let referralData;
            if (body.reference_code) {
                referralData = await WalletClaimsModel.findOne({ where: { reference_id: body.reference_code,isClaimed:0 },raw: true});
                if(!referralData){
                    throw new BadRequestError(req.t("reference_code_not_exist"));
                }
            }
        let otp = await generateOTP();
        let authRecord = {
            otp: otp
        }
        let country = await CountryModel.findOne({ where: { iso_code_2: body.region }, raw: true })

        await SEND_SMS.sms(otp, "+" + country.isd_code + body.phone);

        return authRecord;
    } catch (error) {
        if (error && error.errors && error.errors[0] && error.errors[0].message && error.errors[0].message.indexOf("unique") != -1) {
            let uniqueText = error.errors[0].path == "email" ? req.t("alternate_login_option_error_email") : req.t("alternate_login_error_option_mobile")
            throw new BadRequestError(uniqueText);
        } else {
            throw new BadRequestError(error);
        };
    }

}
let signup = async (req) => {
    let body = req.body
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }
    ['name', 'phone', 'username', 'region', 'password', 'gender'].forEach(x => {
        if (!body[x]) {
            throw new BadRequestError(req.t(x) + " is required");
        }
    });
    let user = await UserModel
        .findOne({ where: { username: body.username.trim() }, attributes: ['id', 'phone'] });

    if (user) {
        throw new BadRequestError(req.t("user_exist"));
    }
    if (body.email) {
        user = await UserModel
            .findOne({ where: { email: body.email.trim() }, attributes: ['id', 'phone'] });

        if (user) {
            throw new BadRequestError(req.t("email_exist"));
        }
    }
   
        user = await UserModel
            .findOne({ where: { phone: { $like: `%${body.phone.trim()}%` } }, attributes: ['id', 'phone'] });

        if (user) {
            throw new BadRequestError(req.t("phone_exist"));
        }


        let createData = {
            name: body.name.trim(),
            email: body.email.trim(),
            phone: body.phone.trim(),
            region: body.region.trim(),
            username: body.username.trim(),
            password: md5(body.password.trim()),
            gender: body.gender,
            latitude: body.latitude,
            longitude: body.longitude,
            notification_token: body.notification_token,
            isVerified: 1,
            isTermsConditionAccepted: body.termscondition,
            user_unique_id: Date.now().toString()
        }
        let referralData;
        if (body.reference_code) {
            referralData = await WalletClaimsModel.findOne({ where: { reference_id: body.reference_code,isClaimed:0 },raw: true});
            if(!referralData){
                throw new BadRequestError(req.t("reference_code_not_exist"));
            }
        }
        try {
            
            let _customer;
            let custId = await StripeFunc.createCustomer({ phone: body.phone.trim(), name: body.name.trim() });
            createData["customer_id"] = custId;
            let customer = await UserModel.create(createData);

            _customer = customer.toJSON();
            let authToken = await generateAuthToken(_customer.phone);
            let authRecord = {
                userid: _customer.id,
                token: authToken,
            }
            await UserAuthModel.destroy({ where: { userid: _customer.id } });
            await UserAuthModel.create(authRecord);
            delete authRecord.userid;

            //create comechat user start
            const data = {
                uid: _customer.user_unique_id,
                name: _customer.name,
            };
            const headers = {
                'apiKey': process.env.COMECHAT_API_KEY,
                'Content-Type': 'application/json',
            };
            let url = "https://" + process.env.COMECHAT_APP_ID + ".api-" + process.env.COMECHAT_REGION + ".cometchat.io/v3/users";
            let resp = await axios.post(url, data, { headers: headers })

            if (resp.status != 200) {
                await UserModel.destroy({ where: { id: _customer.id } });
                throw new BadRequestError(req.t("comechat_user_create_error"));
            }
            //create comechat user ends
            //add wallet info to user
            
            if (body.reference_code) {                
                let senderWalletInfo  = await WalletModel.findOne({ where: { id: referralData.senderWalletId }, raw: true });             
                let senderInfo = await UserModel.findOne({ where: { id: senderWalletInfo.userId }, raw: true });           
                await WalletModel.update({ destination_userId:_customer.id  }, { where: { id: senderWalletInfo.id } });
                let receiverWalletData = {
                    userId: _customer.id,
                    order_date: new Date(),
                    amount: Number(referralData.amount) * 100,
                    order_status: 'success',
                    ordertype: '2',
                    trans_id: await CommonHelper.getUniqueTransactionId(),
                    source_userId: senderWalletInfo.userId,
                    source_wallet_id: senderWalletInfo.id
                }
                let receiverWalletInfo = await WalletModel.create(receiverWalletData);
        
                //update receiver wallet
                let receiverBalanceLogData = {
                    userId: _customer.id,
                    amount: Number(referralData.amount),
                    oldbalance: 0,
                    newbalance:  Number(referralData.amount),
                    transaction_type: '1',
                    wallet_id: receiverWalletInfo.id
                }
                await BalanceLogModel.create(receiverBalanceLogData);
                await WalletClaimsModel.update({ isClaimed: 1,receiverWalletId:receiverWalletInfo.id}, { where: { id: referralData.id } });
                await UserModel.update({ balance: Number(referralData.amount)  }, { where: { id: _customer.id } });
                let receiverCountry;
                if (_customer.region) {
                    receiverCountry = await CountryModel.findOne({ where: { iso_code_2: _customer.region }, raw: true })
                    if (receiverCountry) {
                        _customer.phone = "+" + receiverCountry.isd_code + _customer.phone;
                    }
                }
                let notificationDataReceiver = {
                    title: "Congrats! You have received money from " + senderInfo.phone,
                    subtitle: referralData.amount + " Successfully Transfered from " + senderInfo.phone + " to Your Wallet",
                    redirectscreen: "payment_received_wallet",
                    wallet_id: receiverWalletInfo.id,
                    transaction_id: receiverWalletInfo.trans_id
                }
                await NotificationHelper.sendFriendRequestNotificationToUser(_customer.id, notificationDataReceiver);
                let country = await CountryModel.findOne({ where: { iso_code_2: senderInfo.region }, raw: true })
                SEND_SMS.paymentReceivedSMS(parseFloat(body.amount), "+" + country.isd_code + senderInfo.phone, _customer.phone);
            }
            return authRecord;
        } catch (error) {
            console.log(error)
            if (error && error.errors && error.errors[0] && error.errors[0].message && error.errors[0].message.indexOf("unique") != -1) {
                let uniqueText = error.errors[0].path == "email" ? req.t("alternate_login_option_error_email") : req.t("alternate_login_error_option_mobile")
                throw new BadRequestError(uniqueText);
            } else {
                throw new BadRequestError(error);
            };
        }
  

}
let loginWithSocial = async (body, req) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }
    if (helper.undefinedOrNull(body.social_id)) {
        throw new BadRequestError(req.t("social_id") + ' ' + req.t("comes_empty"));
    }
    if (helper.undefinedOrNull(body.type)) {
        throw new BadRequestError(req.t("type") + ' ' + req.t("comes_empty"));
    }
    let findData = {}
    if (body.type == 1) {
        findData = { gmail_id: body.social_id };
    } else if (body.type == 2) {
        findData = { twitter_id: body.social_id };
    } else if (body.type == 3) {
        findData = { facebook_id: body.social_id };
    } else if (body.type == 4) {
        findData = { linkedin_id: body.social_id };
    }

    let user1 = await UserModel
        .findOne({ where: findData, attributes: ['id', 'phone', 'email', 'region'], raw: true });
    if (!user1) {
        findData["user_unique_id"] = Date.now().toString()
        let custId = await StripeFunc.createCustomer({ description: findData["user_unique_id"] });
        findData["customer_id"] = custId;

        let user = await UserModel.create(findData);
        let authToken = await generateAuthToken(user.phone);
        let authRecord = {
            userid: user.id,
            token: authToken
        }
        await UserAuthModel.destroy({ where: { userid: user.id } });
        await UserAuthModel.create(authRecord);
        const data = {
            uid: user.user_unique_id,
            name: user.user_unique_id
        };
        const headers = {
            'apiKey': process.env.COMECHAT_API_KEY,
            'Content-Type': 'application/json',
        };
        let url = "https://" + process.env.COMECHAT_APP_ID + ".api-" + process.env.COMECHAT_REGION + ".cometchat.io/v3/users";
        let resp = await axios.post(url, data, { headers: headers })

        if (resp.status != 200) {
            await UserModel.destroy({ where: { id: user.id } });
            throw new BadRequestError(req.t("comechat_user_create_error"));
        }

        return { token: authToken }
    } else {
        let authToken = await generateAuthToken(user1.phone);
        let authRecord = {
            userid: user1.id,
            token: authToken
        }
        await UserAuthModel.destroy({ where: { userid: user1.id } });
        await UserAuthModel.create(authRecord);
        return { token: authToken }
    }

}
let resendOTP = async (userid, req) => {
    if (helper.undefinedOrNull(userid)) {
        throw new BadRequestError(req.t("user_token_404"));
    }
    let user = await UserModel.findOne({ where: { id: userid }, attributes: ['id', 'region', 'phone'], raw: true })
    let authToken = await generateAuthToken(user.phone);
    let otp = await generateOTP();
    let authRecord = {
        userid: user.id,
        token: authToken,
        otp: otp
    }
    await UserAuthModel.destroy({ where: { userid: user.id } });
    await UserAuthModel.create(authRecord);
    let country = await CountryModel.findOne({ where: { iso_code_2: user.region }, raw: true })
    await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
    return { token: authToken }
}
let verifyOTP = async (userid, otp, req) => {


    let userAuth = await UserAuthModel.findOne({ where: { userid: userid, otp: otp }, raw: true, attributes: ['userid', 'token'] });

    if (!userAuth || !userAuth.userid) {
        throw new BadRequestError(req.t("invalid_otp"));
    }
    await UserAuthModel.update({ otp: null }, { where: { userid: userid, otp: otp }, raw: true });
    return { token: userAuth.token };

}
let phoneSignIn = async (body, req) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }

    if (helper.undefinedOrNull(body.phone)) {
        throw new BadRequestError(req.t("phone") + '/' + req.t("email") + ' ' + req.t("is_required"));
    }
    if (helper.undefinedOrNull(body.password)) {
        throw new BadRequestError(req.t("password") + ' ' + req.t("is_required"));
    }

    let findData = {}
    findData["$or"] = [
        { phone: { $eq: body.phone } },
        { email: { $eq: body.phone } },
        { username: { $eq: body.phone } }
    ]
    findData["$and"] = [
        { password: { $eq: md5(body.password) } }
    ]

    let user = await UserModel
        .findOne({ where: findData, attributes: ['id', 'phone'], raw: true });
    if (!user) {
        throw new BadRequestError(req.t("invalid_creds"));
    }
    let authToken = await generateAuthToken(user.phone);
    let authRecord = {
        userid: user.id,
        token: authToken
    }
    await UserAuthModel.destroy({ where: { userid: user.id } });
    await UserAuthModel.create(authRecord);
    return { token: authToken }


}
let phoneSignInWithOTP = async (body, req) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }

    if (helper.undefinedOrNull(body.phone)) {
        throw new BadRequestError(req.t("phone") + '/' + req.t("email") + ' ' + req.t("is_required"));
    }
    if (helper.undefinedOrNull(body.region)) {
        throw new BadRequestError(req.t("region") + ' ' + req.t("is_required"));
    }


    let country = await CountryModel.findOne({ where: { iso_code_2: body.region }, raw: true })

    let user = await UserModel
        .findOne({ where: { phone: body.phone, region: body.region }, attributes: ['id', 'phone'], raw: true });
    if (!user) {
        throw new BadRequestError(req.t("user_404"));
    }

    let authToken = await generateAuthToken(user.phone);
    let otp = await generateOTP();
    let authRecord = {
        userid: user.id,
        token: authToken,
        otp: otp
    }
    await UserAuthModel.destroy({ where: { userid: user.id } });
    await UserAuthModel.create(authRecord);

    await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
    return { token: authToken }
}
let forgotPassword = async (body, req) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }

    if (helper.undefinedOrNull(body.phone)) {
        throw new BadRequestError(req.t("phone") + ' ' + req.t("is_required"));
    }
    let findData = {}
    findData["$or"] = [
        { phone: { $eq: body.phone } },
        { email: { $eq: body.phone } },
        { username: { $eq: body.phone } }
    ]
    let user = await UserModel
        .findOne({ where: findData, attributes: ['id', 'phone', 'email', 'region'], raw: true });
    if (!user) {
        throw new BadRequestError(req.t("user_404"));
    }
    let country = await CountryModel.findOne({ where: { iso_code_2: user.region }, raw: true })
    let authToken = await generateAuthToken(user.phone);
    let otp = await generateOTP();
    let authRecord = {
        userid: user.id,
        token: authToken,
        otp: otp
    }
    await UserAuthModel.destroy({ where: { userid: user.id } });
    await UserAuthModel.create(authRecord);
    // if (user.email) {
    //     await SEND_EMAIL.SendPasswordResetOTP(user.email, otp);
    // }
    if (user.phone) {
        await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
    }
    return { token: authToken }
}
let changePassword = async (userid, body, req) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }

    if (helper.undefinedOrNull(body.password)) {
        throw new BadRequestError(req.t("phone") + '/' + req.t("email") + ' ' + req.t("is_required"));
    }
    if (helper.undefinedOrNull(body.confirmpassword)) {
        throw new BadRequestError(req.t("region") + ' ' + req.t("is_required"));
    }
    if (body.password != body.confirmpassword) {
        throw new BadRequestError(req.t("password_not_matched"));
    }


    await UserModel.update({ password: md5(body.password) }, { where: { id: userid }, raw: true });
    return { message: req.t("password") + ' ' + req.t("changed_success") }
}
let signout = async (userid, req) => {
    if (!userid) {
        throw new BadRequestError(req.t("id") + ' ' + req.t("is_required"));
    }
    await UserAuthModel
        .destroy({ where: { userid: userid } });
    return true;
}
let countryList = async () => {
    let Country = await CountryModel.findAll({ order: [['name', 'ASC']], raw: true })
    Country = Country.map((country) => { country.flag = process.env.BASE_URL + process.env.FLAG_PATH + country.iso_code_2.toLowerCase() + ".png"; return country })
    return Country;

}
// let faqList = async () => {
//     return FAQModel.findAll({ order: [['id', 'DESC']], raw: true })   

// }
let generateAuthToken = async (phone) => {
    return uuidv4();
}
let generateOTP = async () => {
    return Date.now().toString().slice(process.env.OTP_LENGTH);
}


let getTermsCondition = async (body) => {
    return TermsConditionModel.findAll({ order: [['displayorder', 'ASC']], raw: true })
}
let getProfile = async (userid, req) => {

    return UserModel
        .findOne({ where: { id: userid }, attributes: ['user_unique_id', 'name', 'profileimage', 'username', 'email', 'phone', 'region',  'latitude', 'longitude', 'gender', 'isactive', 'notification_token', 'isSound', 'isVibration', 'isNotification', 'isTermsConditionAccepted', 'language', 'customer_id', 'balance','membershipId','isMerchant','isMerchantVerified','isMerchantEnabled','merchant_name','merchant_phone','merchant_address','licence_proof','address_proof','utility_proof'], raw: true });
}
let getProfileById = async (uuid) => {

    return UserModel
        .findOne({ where: { user_unique_id: uuid }, attributes: ['user_unique_id', 'name', 'profileimage', 'username', 'email', 'phone', 'region', 'latitude', 'longitude', 'gender', 'isactive', 'notification_token', 'isSound', 'isVibration', 'isNotification', 'isTermsConditionAccepted', 'language', 'customer_id', 'balance','isMerchant','isMerchantVerified','isMerchantEnabled','merchant_name','merchant_phone','merchant_address','licence_proof','address_proof','utility_proof'], raw: true });
}

let updateProfile = async (userid, req) => {

    let body = req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }
    let updatedData = {}
    let optionalFiled = ['name', 'latitude', 'longitude', 'gender', 'notification_token', 'isSound', 'isVibration', 'isNotification', 'isTermsConditionAccepted', 'language'];
    optionalFiled.forEach(x => {
        updatedData[x] = body[x]
    });
    let user = await UserModel
        .findOne({ where: { id: userid }, attributes: ['id', 'bucketKey', 'user_unique_id'], raw: true });


    if (req.files.profileimage && req.files.profileimage.length > 0) {
        const result = await s3Helper.uploadFile(req.files.profileimage[0])
        await unlinkFile(req.files.profileimage[0].path)
        if (user.bucketKey) {
            await s3Helper.deleteFileFromBucket(user.bucketKey)
        }
        updatedData.profileimage = result.Location
        updatedData.bucketKey = result.Key
        //update profile image start in comechat
        const data = {
            avatar: result.Location
        };
        const headers = {
            'apiKey': process.env.COMECHAT_API_KEY,
            'Content-Type': 'application/json',
        };
        let url = "https://" + process.env.COMECHAT_APP_ID + ".api-" + process.env.COMECHAT_REGION + ".cometchat.io/v3/users/" + user.user_unique_id;
        let resp = await axios.put(url, data, { headers: headers })
        if (resp.status != 200) {
            throw new BadRequestError(req.t("comechat_user_update_image_error"));
        }
        //update profile image ends in comechat
    }
    if (body.name) {
        const data = {
            name: body.name
        };
        const headers = {
            'apiKey': process.env.COMECHAT_API_KEY,
            'Content-Type': 'application/json',
        };
        let url = "https://" + process.env.COMECHAT_APP_ID + ".api-" + process.env.COMECHAT_REGION + ".cometchat.io/v3/users/" + user.user_unique_id;
        let resp = await axios.put(url, data, { headers: headers })
        if (resp.status != 200) {
            throw new BadRequestError(req.t("comechat_user_update_image_error"));
        }

        //remove undefined values from json
        Object.keys(updatedData).forEach(function (key) {
            if (updatedData[key] === undefined) {
                delete updatedData[key];
            }
        });
    }

    await UserModel.update(updatedData, { where: { id: userid }, raw: true });
    return { message: req.t("profile") + ' ' + req.t("update_success") };
}
let updateUsername = async (userid, body, req) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }
    if (helper.undefinedOrNull(body.username)) {
        throw new BadRequestError(req.t('username') + ' ' + req.t("is_required"));
    }

    let user = await UserModel
        .findOne({ where: { username: body.username.trim() }, attributes: ['id'], raw: true });
    if (user && user.id != userid) {
        throw new BadRequestError(req.t('user_exist'));
    }
    await UserModel.update({ username: body.username.trim() }, { where: { id: userid }, raw: true });
    return { message: req.t("username") + ' ' + req.t("update_success") };

}
let updateEmail = async (userid, body, req) => {

    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }
    if (helper.undefinedOrNull(body.email)) {
        throw new BadRequestError(req.t("email") + ' ' + req.t("is_required"));
    }

    let user = await UserModel
        .findOne({ where: { email: body.email.trim() }, attributes: ['id'], raw: true });
    if (user && user.id != userid) {
        throw new BadRequestError(req.t("email_exist"));
    }
    if (!body.isVerified) {
        let otp = await generateOTP();
        await SEND_EMAIL.SendUpdateEmailOTP(body.email.trim(), otp);
        return { otp: otp }
    }
    await UserModel.update({ email: body.email.trim() }, { where: { id: userid }, raw: true });
    return { message: req.t("email") + ' ' + req.t("update_success") };
}
let updatePassword = async (userid, body, req) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }

    if (helper.undefinedOrNull(body.newpassword)) {
        throw new BadRequestError(req.t("new_password") + ' ' + req.t("is_required"));
    }
    if (helper.undefinedOrNull(body.confirmpassword)) {
        throw new BadRequestError(req.t("confirm_password") + ' ' + req.t("is_required"));
    }
    if (body.newpassword != body.confirmpassword) {
        throw new BadRequestError(req.t("new_pass_old_pass_not_match"));
    }
    await UserModel.update({ password: md5(body.newpassword) }, { where: { id: userid }, raw: true });
    return { message: req.t("password") + ' ' + req.t("update_success") };
}
let updatePhone = async (userid, body, req) => {

    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError(req.t("body_empty"));
    }
    if (helper.undefinedOrNull(body.phone)) {
        throw new BadRequestError(req.t("phone") + '/' + req.t("is_required"));
    }
    if (helper.undefinedOrNull(body.region)) {
        throw new BadRequestError(req.t("region") + ' ' + req.t("is_required"));
    }


    let user = await UserModel
        .findOne({ where: { phone: body.phone.trim(), region: body.region.trim() }, attributes: ['id'], raw: true });
    if (user && user.id != userid) {
        throw new BadRequestError(req.t("phone_exist"));
    }
    if (!body.isVerified) {
        let otp = await generateOTP();
        let country = await CountryModel.findOne({ where: { iso_code_2: body.region }, raw: true })
        await SEND_SMS.sms(otp, "+" + country.isd_code + body.phone);
        return { otp: otp }
    }
    await UserModel.update({ phone: body.phone.trim(), region: body.region.trim() }, { where: { id: userid }, raw: true });
    return { message: req.t("phone") + +req.t("update_success") };
}

let deleteUser = async (uuid) => {
    let user = await UserModel.findOne({ where: { user_unique_id: uuid }, raw: true });
    await UserAuthModel.destroy({ where: { userid: user.id } });
    await UserModel.destroy({ where: { id: user.id } });
    let url = "https://" + process.env.COMECHAT_APP_ID + ".api-" + process.env.COMECHAT_REGION + ".cometchat.io/v3/users/" + uuid;
    var options = {
        method: 'delete',
        url: url,
        headers: {
            'apiKey': process.env.COMECHAT_API_KEY,
            'Content-Type': 'application/json'
        },
        "body": {
            "permanent": true
        },
        "json": true
    };
    let resp = await axios(options);
}
let verifyTransactionalOTP = async (userid, body, req) => {    
    let matchedResult = await TransactionalOTPModel.findOne({ where: { otp: body.otp, hash: body.hash,userId:userid,type:body.type }, order: [['id', 'DESC']],raw: true });    
    if (!matchedResult) {
        throw new BadRequestError(req.t("otp_invalid"));
    }
    await TransactionalOTPModel.destroy({ where: { id: matchedResult.id } });
    return true;
}
let generateTransactionalOTP = async (userid, body, req) => {
    let user = await UserModel.findOne({ where: { id: userid }, attributes: ['id', 'region', 'phone'], raw: true })    
    let otp = await generateOTP();    
    let country = await CountryModel.findOne({ where: { iso_code_2: user.region }, raw: true })
    let data = { otp: otp, hash: body.hash,userId:userid,type:body.type}
    await TransactionalOTPModel.create(data);    
    if(body.type == 1){
        await SEND_SMS.TransactionalOTPForBankTransfer(otp, "+" + country.isd_code + user.phone);
    }else if(body.type == 2){
        await SEND_SMS.TransactionalOTPForCashPickup(otp, "+" + country.isd_code + user.phone);
    }else if(body.type == 3){
        await SEND_SMS.TransactionalOTPForWalletTransfer(otp, "+" + country.isd_code + user.phone);
    }else if (body.type == 4){
        await SEND_SMS.TransactionalOTPForRecharge(otp, "+" + country.isd_code + user.phone);
    }
    return true;
}
module.exports = {
    countryList: countryList,
    faqList:faqList,
    signup: signup,
    sendOtpForRegistration: sendOtpForRegistration,
    resendOTP: resendOTP,
    changePassword: changePassword,
    phoneSignIn: phoneSignIn,
    forgotPassword: forgotPassword,
    phoneSignInWithOTP: phoneSignInWithOTP,
    verifyOTP: verifyOTP,
    signout: signout,
    generateAuthToken: generateAuthToken,
    generateOTP: generateOTP,
    loginWithSocial: loginWithSocial,
    getProfile: getProfile,
    getProfileById: getProfileById,
    updateProfile: updateProfile,
    updateUsername: updateUsername,
    updateEmail: updateEmail,
    updatePassword: updatePassword,
    updatePhone: updatePhone,
    getTermsCondition: getTermsCondition,
    deleteUser: deleteUser,
    generateTransactionalOTP:generateTransactionalOTP,
    verifyTransactionalOTP:verifyTransactionalOTP
};
