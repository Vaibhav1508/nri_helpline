"use strict";

let helper = require("../../helpers/helpers"),
  config = process.config.global_config,
  md5 = require("md5"),
  UserModel = require("../../models/User"),
  ProfessionsModel = require("../../models/Profession"),
  CountriesModel = require("../../models/Countries"),
  StateModel = require("../../models/State"),
  CityModel = require("../../models/City"),
  ProfessionModel = require("../../models/Profession"),
  PollQuestionUserAnswersModal = require("../../models/Poll_question_user_answers"),
  PollQuestionUserAnswerOptionsModal = require("../../models/Poll_question_user_answer_options"),
  UpcomingServiceFeedbacksModal = require("../../models/Upcoming_service_feedbacks"),
  fs = require("fs"),
  BadRequestError = require("../../errors/badRequestError");

  const axios = require('axios');
const { v4: uuidv4 } = require("uuid");

let generateAuthToken = async (phone) => {
  return uuidv4();
};

let SendOtp = async (body,req) => {
  if (helper.undefinedOrNull(body)) {
    return { status : 400, message: "body_empty." }
  }
  if (helper.undefinedOrNull(body.v_mobile_number) || body.v_mobile_number?.trim('') == "") {
    return { status : 400, message: "mobile number is required." }
  }
  if (helper.undefinedOrNull(body.i_country_id) || body.i_country_id?.trim('') == "" || body.i_country_id == "0") {
    return { status : 400, message: "country id is required." }
  }
  if (!req.headers['e-device-type']) {
    // throw new BadRequestError("Device type is required");
    return { status : 400, message: "Device type is required." }
  }
  if (!req.headers['v-device-token']) {
    // throw new BadRequestError("Device token is required");
    return { status : 400, message: "Device token is required." }
  }
  let findData = {}
  findData["$and"] = [
      { v_mobile_number: { $eq: body.v_mobile_number } },
  ]
  let user = await UserModel
      .findOne({ where: findData, raw: true });
  if(user) {
    if(user.e_status == 'Inactive') {
      return { status : 400, message: "Your account has be deactivated by admin, Contact to admin." }
    }
    if(user.i_country_id != body.i_country_id) {
      return {status : 400, message: "Mobile number already exist."}  
    }

    let otp;
    if(body.v_mobile_number.toString() != '9999999999')
    {
      otp = await GenerateOTP();
    }
    else
    {
      otp = '1234'; 
    }
    
    let authRecord = {
      v_otp: otp,
      i_country_id: body.i_country_id,
      e_device_type : req.headers['e-device-type'],
      v_device_token : req.headers['v-device-token']
    }
    await UserModel.update(authRecord, {
      where: { id: user.id },
      raw: true,
    });
    // if (user.email) {
    //     await SEND_EMAIL.SendPasswordResetOTP(user.email, otp);
    // }
    // if (user.phone) {
    //     await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
    // }

  

    const authkey = '413547AdaW0D0fuS659fbacfP1'; // Replace with your authkey

    //const authkey = '409083ANWrORRSQr465422c17P1'; // Replace with your authkey


    const url = 'https://control.msg91.com/api/v5/otp?';
    let countryId = await CountriesModel.findOne({ where: { id: body.i_country_id }, raw: true });
    let recipients= []
    let mobilenumber = "";
    if(body.v_mobile_number.toString() == '9999999999' && body.i_country_id.toString() == '103') {
      recipients =  [
        {
          mobiles: 919999999999,
          var1: 1234,
        }
      ]
      
      mobilenumber = 919999999999;

    } else {
      recipients =[
        {
          mobiles: countryId.v_code.toString()+body.v_mobile_number,
          var1: otp,
        }
      ]

      mobilenumber = countryId.v_code.toString()+body.v_mobile_number;
    }
    const data = {
      template_id: '659fb850d6fc051e8128e592',
      otp:otp,
      mobile :  mobilenumber,
    };

    const config = {
      headers: {
        authkey: authkey,
      },
    };

    axios
      .post(url, data, config)
      .then((response) => {
        console.log('OTP SMS sent successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error sending OTP SMS:', error);
    });
    return { otp_sent : true, e_is_old_user: user.v_api_token == null ? "No" : "Yes" }
  } else {
    let otp;
    if(body.v_mobile_number.toString() != '9999999999')
    {
      otp = await GenerateOTP();
    }
    else
    {
      otp = '1234'; 
    }
    let authRecord = {
      v_mobile_number: body.v_mobile_number,
      v_otp: otp,
      i_country_id: body.i_country_id,
      e_device_type : req.headers['e-device-type'],
      v_device_token : req.headers['v-device-token']
    }
    await UserModel.create(authRecord);
    // if (user.email) {
    //     await SEND_EMAIL.SendPasswordResetOTP(user.email, otp);
    // }
    // if (user.phone) {
    //     await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
    // }

    const authkey = '413547AdaW0D0fuS659fbacfP1'; // Replace with your authkey

    const url = 'https://control.msg91.com/api/v5/otp?';

    let countryId = await CountriesModel.findOne({ where: { id: body.i_country_id }, raw: true });

    let recipients= []
    let mobilenumber = "";
    if(body.v_mobile_number.toString() == '9999999999' && body.i_country_id.toString() == '103') {
      recipients =  [
        {
          mobiles: 919999999999,
          var1: 1234,
        }
      ]


      mobilenumber = 919999999999;

    } else {
      recipients =[
        {
          mobiles: countryId.v_code.toString()+body.v_mobile_number,
          var1: otp,
        }
      ]

      mobilenumber = countryId.v_code.toString()+body.v_mobile_number;

    }

    const data = {
      template_id: '659fb850d6fc051e8128e592',
      otp:otp,
      mobile :  mobilenumber,
    };

    const config = {
      headers: {
        authkey: authkey,
      },
    };

    axios
      .post(url, data, config)
      .then((response) => {
        console.log('OTP SMS sent successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error sending OTP SMS:', error);
    });
    return { otp_sent : true, e_is_old_user: "No" }
  }
  
}

let GenerateOTP = async () => {
    const timestamp = Date.now().toString();
    const otp = timestamp.slice(-4).padStart(4, '0');
    return otp;
}

let VerifyOtp = async (body, req) => {
  if (helper.undefinedOrNull(body)) {
    return { status : 400, message: "body_empty." }
  }
  if (helper.undefinedOrNull(body.v_mobile_number) || body.v_mobile_number?.trim('') == "") {
    return { status : 400, message: "mobile number is required." }
  }
  if (helper.undefinedOrNull(body.i_country_id) || body.i_country_id?.trim('') == "" || body.i_country_id == "0" || !body.i_country_id) {
    return { status : 400, message: "country id is required." }
  }
  if (!req.headers['e-device-type']) {
    // throw new BadRequestError("Device type is required");
    return { status : 400, message: "Device type is required." }
  }
  if (!req.headers['v-device-token']) {
    // throw new BadRequestError("Device token is required");
    return { status : 400, message: "Device token is required." }
  }
  if (helper.undefinedOrNull(body.v_otp) || body.v_otp == "") {
    return { status : 400, message: "otp is required." }
  }
  let findData = {}
  findData["$and"] = [
      { v_mobile_number: { $eq: body.v_mobile_number }  },
  ]
  let user = await UserModel
      .findOne({ where: findData, raw: true });
  if (!user) {
    return { status : 400, message: "User is not valid." }
  }
  if(user.v_otp != body.v_otp ) {
    return { status : 400, message: "Otp is not valid." }
  }

  if(user.e_status == 'Inactive') {
    return { status : 400, message: "Your account has be deactivated by admin, Contact to admin." }
  }
  const currentTimestamp = Date.now();
  let authToken = await generateAuthToken(currentTimestamp.toString());
  let authRecord = {
    e_device_type : req.headers['e-device-type'],
    v_device_token : req.headers['v-device-token'],
    v_api_token : authToken,
    v_otp: null
  }
  
  await UserModel.update(authRecord, {
    where: { id: user.id },
    raw: true,
  });

  let userDetail = await UserModel
      .findOne({ where: findData, raw: true });
      userDetail.v_profile_image_path = userDetail.v_profile_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + userDetail.v_profile_image : null;
      if (userDetail) {
        userDetail.country = {};  // Initialize country object
        userDetail.state = {};    // Initialize state object
        userDetail.city = {};     // Initialize city object
        userDetail.profession = {};     // Initialize profession object
        // Fetch the country name
        let country = {}
        let other_country = {}
        let state = {}
        let city = {}
        let profession = {}
        if(userDetail.i_country_id) {
          country = await CountriesModel.findOne({ where: { id: userDetail.i_country_id }, raw: true });
          country.v_image_path = country.v_image ? process.env.BASE_URL+'/'+config.upload_folder + config.upload_entities.countries_image_folder + country.v_image : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
        }

        if(userDetail.i_other_country_id) {
          other_country = await CountriesModel.findOne({ where: { id: userDetail.i_other_country_id }, raw: true });
        }
        
        // Fetch the state name
        if(userDetail.i_state_id) {
          state = await StateModel.findOne({ where: { id: userDetail.i_state_id }, raw: true });
        }
      
        // Fetch the city name
        if(userDetail.i_city_id) {
          city = await CityModel.findOne({ where: { id: userDetail.i_city_id }, raw: true });
        }
    
        if(userDetail.i_profession_id) {
          profession = await ProfessionModel.findOne({ where: { id: userDetail.i_profession_id }, raw: true });
        }
      
        // Add country, state, and city names to the userDetail object
        userDetail.country = JSON.stringify(country) == '{}' ? null : country;
        userDetail.other_country = userDetail.i_other_country_id && JSON.stringify(other_country) != '{}' ? other_country : null;
        userDetail.state = JSON.stringify(state) == '{}' ? null : state;
        userDetail.city = JSON.stringify(city) == '{}' ? null : city;
        userDetail.profession = JSON.stringify(profession) == '{}' ? null : profession;
    
        delete userDetail.i_country_id
        delete userDetail.i_other_country_id
        delete userDetail.i_state_id
        delete userDetail.i_city_id
        delete userDetail.i_profession_id
      }

  userDetail.e_is_old_user = user.v_api_token == null ? "No" : "Yes"
  // if (user.email) {
  //     await SEND_EMAIL.SendPasswordResetOTP(user.email, otp);
  // }
  // if (user.phone) {
  //     await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
  // }
  return { otp_verified : true, user: userDetail }
}

let UpdateProfile = async (body, req) => {
  if (helper.undefinedOrNull(body)) {
    return { status : 400, message: "body_empty." }
  }
  if (helper.undefinedOrNull(body.v_full_name) || body.v_full_name?.trim('') == "") {
    return { status : 400, message: "full name is required." }
  }
  if (helper.undefinedOrNull(body.v_email) || body.v_email?.trim('') == "") {
    return { status : 400, message: "email is required." }
  }
  if (body.i_country_id) {
    return { status : 400, message: "country id is not allowd to update." }
  }
  if (body.v_mobile_number) {
    return { status : 400, message: "mobile number is not allowd to update." }
  }
  if (!req.headers['e-device-type']) {
    // throw new BadRequestError("Device type is required");
    return { status : 400, message: "Device type is required." }
  }
  if (!req.headers['v-device-token']) {
    // throw new BadRequestError("Device token is required");
    return { status : 400, message: "Device token is required." }
  }
  let findData = {}
  findData["$and"] = [
      { id: { $eq: req.user.userId } },
  ]
  let user = await UserModel
      .findOne({ where: findData, raw: true });
  if (!user) {
    return { status : 400, message: "User not found." }
  }
  
  let country = {}
  let other_country = {}
  let state = {}
  let city = {}
  let profession = {}
  if(user.i_country_id) {
    country = await CountriesModel.findOne({ where: { id: user.i_country_id }, raw: true });
    if(!country) {
      return { status : 400, message: "country not found." }
    }
  }

  if(body.i_other_country_id || user.i_other_country_id) {
    other_country = await CountriesModel.findOne({ where: { id: body.i_other_country_id ? body.i_other_country_id : user.i_other_country_id }, raw: true });
    if(!other_country) {
      return { status : 400, message: "Other country not found." }
    }
  }
  // Fetch the state name
  if(body.i_state_id || user.i_state_id) {
    state = await StateModel.findOne({ where: { id: body.i_state_id ? body.i_state_id : user.i_state_id }, raw: true });
    if(!state) {
      return { status : 400, message: "state not found." }
    }
  }

  // Fetch the city name
  if(body.i_city_id || user.i_city_id) {
    city = await CityModel.findOne({ where: { id: body.i_city_id ? body.i_city_id : user.i_city_id }, raw: true });
    if(!city) {
      return { status : 400, message: "city not found." }
    }
  }

  if(body.i_profession_id || user.i_profession_id) {
    profession = await ProfessionModel.findOne({ where: { id: body.i_profession_id ? body.i_profession_id : user.i_profession_id }, raw: true });
    if(!profession) {
      return { status : 400, message: "profession not found." }
    }
  }

  let updateRecord = {
    v_full_name: body.v_full_name,
    v_email: body.v_email,
    i_other_country_id: body.i_other_country_id ? body.i_other_country_id : null,
    i_state_id: body.i_state_id ? body.i_state_id : null,
    i_city_id: body.i_city_id ? body.i_city_id : null,
    v_since_year: body.v_since_year,
    i_profession_id: body.i_profession_id ? body.i_profession_id : 0,
    v_india_phone: body.v_india_phone,
    updated_at : Date.now()
  }

  if (req.file && req.file.filename) {
    updateRecord["v_profile_image"] = req.file.filename;
  }

  try{
    await UserModel.update(updateRecord, {
      where: { id: user.id },
      raw: true,
    });
  } catch(err) {
  if(err.parent.code == 'ER_DUP_ENTRY') {
            return {
              "message": "Record with this email is already exist.",
              "status": 400
          }
        }
  }

  let userDetail = await UserModel
      .findOne({ where: findData, raw: true });

      userDetail.v_profile_image_path = userDetail.v_profile_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + userDetail.v_profile_image : null;
      if (userDetail) {
        userDetail.country = {};  // Initialize country object
        userDetail.state = {};    // Initialize state object
        userDetail.city = {};     // Initialize city object
        userDetail.profession = {};     // Initialize profession object
      
        // Add country, state, and city names to the userDetail object
        userDetail.country = JSON.stringify(country) == '{}' ? null : country;
        userDetail.other_country = !userDetail.i_other_country_id ? null : other_country;
        userDetail.state = !userDetail.i_state_id ? null : state;
        userDetail.city = !userDetail.i_city_id ? null : city;
        userDetail.profession = !userDetail.i_profession_id ? null : profession;
        userDetail.country.v_image_path = country.v_image ? process.env.BASE_URL+'/'+config.upload_folder + config.upload_entities.countries_image_folder + country.v_image : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
        delete userDetail.i_country_id
        delete userDetail.i_state_id
        delete userDetail.i_city_id
        delete userDetail.i_profession_id
        delete userDetail.i_other_country_id
      }
  // if (user.email) {
  //     await SEND_EMAIL.SendPasswordResetOTP(user.email, otp);
  // }
  // if (user.phone) {
  //     await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
  // }
  return { user: userDetail }
}

let ProfileDetail = async (body, req) => {
  if(!req.user.userId) {
      return { status : 400, message: "token is required." }
  }
  let userDetail = await UserModel.findOne({
      where: {id : req.user.userId},
      raw: true
  });
  userDetail.v_profile_image_path = userDetail.v_profile_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + userDetail.v_profile_image : null;
  if (userDetail) {
    userDetail.country = {};  // Initialize country object
    userDetail.state = {};    // Initialize state object
    userDetail.city = {};     // Initialize city object
    userDetail.profession = {};     // Initialize profession object
    // Fetch the country name
    let country = {}
    let other_country = {}
    let state = {}
    let city = {}
    let profession = {}
    if(userDetail.i_country_id) {
      country = await CountriesModel.findOne({ where: { id: userDetail.i_country_id }, raw: true });
    }

    if(userDetail.i_other_country_id) {
      other_country = await CountriesModel.findOne({ where: { id: userDetail.i_other_country_id }, raw: true });
    }

    // Fetch the state name
    if(userDetail.i_state_id) {
      state = await StateModel.findOne({ where: { id: userDetail.i_state_id }, raw: true });
    }
  
    // Fetch the city name
    if(userDetail.i_city_id) {
      city = await CityModel.findOne({ where: { id: userDetail.i_city_id }, raw: true });
    }

    if(userDetail.i_profession_id) {
      profession = await ProfessionModel.findOne({ where: { id: userDetail.i_profession_id }, raw: true });
    }
  
    // Add country, state, and city names to the userDetail object
    userDetail.country = JSON.stringify(country) == '{}' ? null : country;
    userDetail.other_country = JSON.stringify(other_country) == '{}' ? null : other_country;;
    userDetail.state = JSON.stringify(state) == '{}' ? null : state;
    userDetail.city = JSON.stringify(city) == '{}' ? null : city;
    userDetail.profession = JSON.stringify(profession) == '{}' ? null : profession;

    delete userDetail.i_country_id
    delete userDetail.i_state_id
    delete userDetail.i_city_id
    delete userDetail.i_profession_id
  }
  return {user : userDetail};
}

let ProfessionList = async (body, req) => {
  let {order_by} = req.query
  order_by = order_by ? order_by.toUpperCase() : 'ASC'
  let findData = {e_status : 'Active' }
  if (body.filters) {
      if (body.filters.searchtext) {
              findData["$and"] = [
                  {v_name: {$like: '%' + body.filters.searchtext + '%'}}
              ]
      }
  }
  let allProfession = await ProfessionsModel.findAll({
      where: findData,
      order: [['i_order', order_by]],
      raw: true
  });
  let allProfessionCount = await ProfessionsModel.count({   
      where: findData,     
      order: [['i_order', order_by]],
      raw: true
  });
  let _result = { total_count: 0 };
  _result.profession = allProfession;
  _result.total_count = allProfessionCount;
  return _result;
}

let LogoutUser = async (body, req) => {
  if(!req.user.userId) {
    return { status : 400, message: "token is required." }
  }
  let userDetail = await UserModel.findOne({
      where: {id : req.user.userId},
      raw: true
  });
  if(!userDetail) {
    return { status : 400, message: "User not found." }
  }
  const currentTimestamp = Date.now();
  let authToken = await generateAuthToken(currentTimestamp.toString());
  let updateRecord = {
    v_device_token : null,
    v_api_token : authToken
  }
  await UserModel.update(updateRecord, {
    where: { id: userDetail.id },
    raw: true,
  });

  return {user : {logout : true}};
}

let DeleteUserAccount = async (body, req) => {
  if(!req.user.userId) {
    return { status : 400, message: "token is required." }
  }
  let userDetail = await UserModel.findOne({
      where: {id : req.user.userId},
      raw: true
  });
  if(!userDetail) {
    return { status : 400, message: "User not found." }
  }
  await UserModel.destroy({
    where: {id : userDetail.id},
    raw: true
  });
  if(userDetail?.v_profile_image) {
    fs.unlink('uploads/profile_image/'+userDetail?.v_profile_image, function (err) {
      if (err) throw err;
      console.log("File deleted!");
    });
  }


  await PollQuestionUserAnswersModal.destroy({
    where: {i_user_id : userDetail.id},
    raw: true
  });
  await PollQuestionUserAnswerOptionsModal.destroy({
    where: {i_user_id : userDetail.id},
    raw: true
  });
  await UpcomingServiceFeedbacksModal.destroy({
    where: {i_user_id : userDetail.id},
    raw: true
  });

  return {user : {account_deleted : true}};
}

module.exports = {
  SendOtp: SendOtp,
  GenerateOTP: GenerateOTP,
  VerifyOtp: VerifyOtp,
  UpdateProfile:UpdateProfile,
  ProfileDetail: ProfileDetail,
  ProfessionList: ProfessionList,
  LogoutUser: LogoutUser,
  DeleteUserAccount: DeleteUserAccount
};
