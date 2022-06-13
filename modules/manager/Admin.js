'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),    
    AdminModel = require("../models/Admin"),
    UsersModel = require("../models/Users"),
    IndustryModel = require("../models/Industry"),
    BadRequestError = require('../errors/badRequestError');
const { v4: uuidv4 } = require('uuid');
    


let generateAuthToken = async (phone) => {
    return uuidv4();
}

let Login = async (body) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("body_empty");
    }

    if (helper.undefinedOrNull(body.userEmail)) {
        throw new BadRequestError("Email ID / User Name is required");
    }
    if (helper.undefinedOrNull(body.userPassword)) {
        throw new BadRequestError("Password is required");
    }

    let findData = {}
    findData["$or"] = [
        { Admin_Email: { $eq: body.userEmail } }
    ]
    findData["$and"] = [
        { Admin_Password: { $eq: md5(body.userPassword) } }
    ]
    let user = await AdminModel
        .findOne({ where: findData, attributes: ['Admin_ID', 'Admin_Mobile'], raw: true });
    
    if (!user) {
        throw new BadRequestError("Please check your credentials again");
    } else {
        return { login: true }    
    }
}

// let changePassword = async (adminid,req_body) => {
    
//     if (helper.undefinedOrNull(req_body)) {
//         throw new BadRequestError('Request body comes empty');
//     }

//     if (helper.undefinedOrNull(req_body.new_password)) {
//         throw new BadRequestError("New Password is required");
//     }
//     if (helper.undefinedOrNull(req_body.old_password)) {
//         throw new BadRequestError("Old Password is required");
//     }
//      let user = await UserModel.findOne({ where: { password:md5(req_body.old_password),id:adminid }, attributes: ['id','email'] ,raw:true})
//     if(!user){
//         throw new BadRequestError("no user found");
//     }
    
//      await UserModel.update({ password: md5(req_body.new_password) }, { where: { id: user.id }, raw: true });
//     return { userId:user.id};

// }


// let signout = async (adminid, authToken) => {    
//     if (!authToken) {
//         throw new BadRequestError("authToken is required");
//     }
//     await UserModel.update({ token:null }, { where: { id: adminid}, raw: true });
//     return true;
// }

let UsersList = async (body) => {
    console.log(body)
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
        if (body.filters) {
            if (body.filters.searchtext) {
					findData["$or"] = [
						{userFirstName: {$like: '%' + body.filters.searchtext + '%'}},
                        {userLastName: {$like: '%' + body.filters.searchtext + '%'}},
					]
            }
        }
    let allUser = await UsersModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['userID', 'DESC']],
        raw: true
    });
    for(let i=0; i < allUser.length; i++) {
        let IndustryName =  await IndustryModel.findOne({where : {industryID : allUser[i].industryID}},{
            raw: true
        });
        allUser[i].industryName = IndustryName?.industryName || '';
    }
    let allUserCount = await UsersModel.count({       
        where: findData, 
        order: [['userID', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.slides = allUser;
    _result.total_count = allUserCount;
    return _result;
}

let UsersDetail = async (req) => {
    if(!req.params.userID) {
        throw new BadRequestError("UserID is required");
    }
    let userData = await UsersModel.findOne({
        where: {userID : req.params.userID},
        raw: true
    });
    let IndustryName =  await IndustryModel.findOne({where : {industryID : userData.industryID}},{
        raw: true
    });
    userData.industryName = IndustryName?.industryName || '';
    return {data : userData};
}

let UserUpdate = async (req) => {
    try {
        let body = req.body.body ? JSON.parse(req.body.body) : req.body;
        if (helper.undefinedOrNull(body)) {
            throw new BadRequestError("body_empty");
        }
        ['userFirstName', 'userLastName','userEmail', 'userMobile', 'industryID','userJobDescription' ].forEach(x => {
            if (!body[x]) {
                throw new BadRequestError(x + " is required");
            }
        });
        let updateData = {};
        let optionalFiled = ['userFirstName', 'userLastName','userEmail', 'userMobile', 'industryID','userJobDescription'];
        optionalFiled.forEach(x => {
            if (body[x]) {
                updateData[x] = body[x];
            }
        });
        await UsersModel.update(updateData, { where: { userID: req.params.userID }, raw: true });
        let  user = await UsersModel.findOne({where:{userID: req.params.userID},raw:true});
            
        return {slides : user}
    } catch(err) {
        console.log(err)
    }    
}

let ChangeUserStatus = async (body) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("body_empty");
    }

    if (helper.undefinedOrNull(body.userID)) {
        throw new BadRequestError("User ID is required");
    }
    if (helper.undefinedOrNull(body.status)) {
        throw new BadRequestError("Status is required");
    }

    let user = await UsersModel
        .findOne({ where: {userID : body.userID}, raw: true });
    if (!user) {
        throw new BadRequestError("Please check your credentials again");
    }
    if(user.userStatus == 'Active' && body.status == 1) {
        throw new BadRequestError("Already activated"); 
    }
    if(user.userStatus == 'Inactive' && body.status != 1) {
        throw new BadRequestError("Already inactivated"); 
    }
    let status = body.status == 1 ? 'Active' : 'Inactive'
    await UsersModel.update({userStatus : status}, { where: {userID : user.userID}, attributes: ['Admin_ID', 'Admin_Mobile'], raw: true });
    return { status : body.status }
}


module.exports = {
    Login: Login,
    UsersList : UsersList,
    ChangeUserStatus : ChangeUserStatus,
    UsersDetail:UsersDetail,
    UserUpdate:UserUpdate
};
