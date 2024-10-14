"use strict";

let helper = require("../helpers/helpers"),
  _ = require("lodash"),
  md5 = require("md5"),
  AdminModel = require("../models/Admin"),
  UserModel = require("../models/User"),
  AdminTokenModel = require("../models/Admin_tokens"),
  BadRequestError = require("../errors/badRequestError");
const { v4: uuidv4 } = require("uuid");
const config = require("../../config/config");
const nodemailer = require('nodemailer');
const moment = require('moment');

let generateAuthToken = async (phone) => {
  return uuidv4();
};

let Login = async (body) => {
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty.");
  }

  if (helper.undefinedOrNull(body.email)) {
    throw new BadRequestError("Email ID / User Name is required.");
  }
  if (helper.undefinedOrNull(body.password)) {
    throw new BadRequestError("Password is required.");
  }

  let findData = {};
  findData["$or"] = [{ v_email: { $eq: body.email } }];
  findData["$and"] = [{ password: { $eq: md5(body.password) } }];
  let user = await AdminModel.findOne({
    where: findData,
    attributes: ["id","v_name", "v_email", "v_image", 'e_type'],
    raw: true,
  });

  if (!user) {
    throw new BadRequestError("Please check your credentials again.");
  }

  user.v_image_path = user.v_image
      ? process.env.BASE_URL +'/'+ config.upload_folder +
        config.upload_entities.admin_image_folder +
        user.v_image
      : config.upload_folder +
        config.upload_entities.admin_image_folder +
        "NO_IMAGE_FOUND.jpg";

  const currentTimestamp = Date.now();
  let authToken = await generateAuthToken(currentTimestamp.toString());
  await AdminModel.update(
    { v_password_token: authToken, api_token: authToken },
    { where: { id: user.id } }
  );

  let tokenData = {
    i_admin_id : user.id,
    v_token : authToken,
    expire_time : moment().add(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
  }

  await AdminTokenModel.create(tokenData)

  return {
    token: authToken,
    login: true,
    user: user
  };
};

let UsersDetail = async (req) => {
  if (!req.admin.adminid) {
    throw new BadRequestError("UserID is required.");
  }
  let userData = await AdminModel.findOne({
    where: { id: req.admin.adminid },
    attributes: ["id", "v_name", 'v_email', 'v_image'],
    raw: true,
  });

  userData.v_image_path = userData.v_image
      ? process.env.BASE_URL+'/'+ config.upload_folder +
        config.upload_entities.admin_image_folder +
        userData.v_image
      : config.upload_folder +
        config.upload_entities.admin_image_folder +
        "NO_IMAGE_FOUND.jpg";
  
  return { data: userData };
};

let UserUpdate = async (req) => {
  try {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("body_empty.");
    }
    [
      "v_name",
      "v_email"
    ].forEach((x) => {
      if (!body[x]) {
        throw new BadRequestError(x + " is required.");
      }
    });
    let updateData = {};
    let optionalFiled = [
      "v_name",
      "v_email"
    ];
    optionalFiled.forEach((x) => {
      if (body[x]) {
        updateData[x] = body[x];
      }
    });
    if (req.file && req.file.filename) {
      updateData["v_image"] = req.file.filename;
    }
    updateData["updated_at"] = Date.now();
    await AdminModel.update(updateData, {
      where: { id: req.admin.adminid },
      raw: true,
    });
    let user = await AdminModel.findOne({
      where: { id: req.admin.adminid },
      raw: true,
    });

    user.v_image_path = user.v_image
      ? process.env.BASE_URL+'/'+ config.upload_folder +
        config.upload_entities.admin_image_folder +
        user.v_image
      : config.upload_folder +
        config.upload_entities.admin_image_folder +
        "NO_IMAGE_FOUND.jpg";

    return { user: user };
  } catch (err) {
    console.log(err);
  }
};

let ForgetPassword = async (body, req) => {
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError(req.t("body_empty."));
  }
  if (helper.undefinedOrNull(body.v_email)) {
      throw new BadRequestError("email is required.");
  }
  let findData = {}
  findData["$or"] = [
      { v_email: { $eq: body.v_email } },
  ]
  let user = await AdminModel
      .findOne({ where: findData, attributes: ['id', 'v_name', 'v_email', 'v_image'], raw: true });
  if (!user) {
      throw new BadRequestError(req.t("user_404."));
  }
  const currentTimestamp = Date.now();
  let authToken = await generateAuthToken(currentTimestamp.toString());
  let otp = await GenerateOTP();
  let authRecord = {
    v_password_token: authToken,
    api_token: authToken,
    v_forgot_passwod_code: authToken
  }
  await AdminModel.update(authRecord, {
    where: { id: user.id },
    raw: true,
  });
  // if (user.email) {
  //     await SEND_EMAIL.SendPasswordResetOTP(user.email, otp);
  // }
  // if (user.phone) {
  //     await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
  // }

  // Create a transporter using your email service provider's SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD
    }
  });

  // Define the email content
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: body.v_email,
    subject: 'Password recovery mail from NRIHELPLINE',
    html: `<p>Hello,</p><p>You have requested to reset your password. Click the following link to reset your password:</p><p><a href="http://34.225.159.179:5000/change-password/${body.v_email}/${authToken}">Reset Password</a></p><p>If you did not request this password reset, you can safely ignore this email.</p><p>Best regards,<br>Your Application Team</p>`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });

  return { mail_Sent : true, code : authToken }
}

let GenerateOTP = async () => {
  return Date.now().toString().slice(process.env.OTP_LENGTH);
}

let ResetPassword = async (body, req) => {
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError(req.t("body_empty."));
  }
  console.log(body.v_email)
  if (helper.undefinedOrNull(body.v_email)) {
    throw new BadRequestError("email is required.");
  }
  if (helper.undefinedOrNull(body.password)) {
      throw new BadRequestError("password is required.");
  }

  if (helper.undefinedOrNull(body.code)) {
    throw new BadRequestError("code is required.");
  }
  let findData = {}
  findData["$or"] = [
      { v_email: { $eq: body.v_email }, v_forgot_passwod_code: { $eq: body.code } },
  ]
  let user = await AdminModel
      .findOne({ where: findData, attributes: ['id', 'v_name', 'v_email', 'v_image'], raw: true });
  if (!user) {
      throw new BadRequestError(req.t("User is not valid."));
  }
  let authRecord = {
    password: md5(body.password)
  }
  await AdminModel.update(authRecord, {
    where: { id: user.id },
    raw: true,
  });
  // if (user.email) {
  //     await SEND_EMAIL.SendPasswordResetOTP(user.email, otp);
  // }
  // if (user.phone) {
  //     await SEND_SMS.sms(otp, "+" + country.isd_code + user.phone);
  // }
  return { changed_password : true }
}

let ChangePassword = async (body, req) => {
  console.log(md5('12345'))
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError(req.t("body_empty."));
  }
  if (helper.undefinedOrNull(body.v_email)) {
    throw new BadRequestError("email is required.");
  }
  if (helper.undefinedOrNull(body.old_password)) {
      throw new BadRequestError("old password is required.");
  }

  if (helper.undefinedOrNull(body.new_password)) {
    throw new BadRequestError("new password is required.");
  }
  if (!body.v_email) {
    throw new BadRequestError("email is required.");
  }
  if (!body.old_password) {
    throw new BadRequestError("old password is required.");
  }
  if (!body.new_password) {
    throw new BadRequestError("new password is required.");
  }
  let findData = {}
  findData["$or"] = [
      { v_email: { $eq: body.v_email }, password: { $eq: md5(body.old_password) } },
  ]
  let user = await AdminModel
      .findOne({ where: findData, raw: true });
  if (!user) {
      throw new BadRequestError(req.t("Old password is not correct."));
  }
  let authRecord = {
    password: md5(body.new_password)
  }
  await AdminModel.update(authRecord, {
    where: { id: user.id },
    raw: true,
  });
  
  return { changed_password : true }
}

let SendOtp = async (body, req) => {
  // let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError(req.t("body_empty."));
  }
  if (helper.undefinedOrNull(body.v_mobile_number)) {
    throw new BadRequestError("mobile number is required.");
  }
  let findData = {}
  findData["$or"] = [
      { v_mobile_number: { $eq: body.v_mobile_number } },
  ]
  let user = await UserModel
      .findOne({ where: findData, attributes: ['id', 'v_full_name', 'v_email', 'v_profile_image'], raw: true });
  if (!user) {
      throw new BadRequestError('User not found.');
  }
  let otp = await GenerateOTP();
  let authRecord = {
    v_otp: otp
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
  return { otp_sent : true, otp : otp }
}

module.exports = {
  Login: Login,
  UsersDetail: UsersDetail,
  UserUpdate: UserUpdate,
  ForgetPassword: ForgetPassword,
  GenerateOTP: GenerateOTP,
  ResetPassword: ResetPassword,
  ChangePassword: ChangePassword,
  SendOtp: SendOtp
};
