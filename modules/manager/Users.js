"use strict";

let helper = require("../helpers/helpers"),
  _ = require("lodash"),
  md5 = require("md5"),
  config = process.config.global_config,
  UserModel = require("../models/Users"),
  UserVoctionModel = require("../models/User_vocations"),
  UserSubVoctionModel = require("../models/User_subvocations"),
  IndustryModel = require("../models/Industry"),
  SubVocationModel = require("../models/SubVocation"),
  SubVoctionModel = require("../models/SubVocation"),
  BadRequestError = require("../errors/badRequestError");
const { v4: uuidv4 } = require("uuid");
const { use } = require("../routes/Users");
const VocationModal = require("../models/Vocation");
const CompanyModal = require("../models/Company");
const userFollowModal = require("../models/UserFollowID");
const { Op } = require("sequelize");

let generateAuthToken = async (phone) => {
  return uuidv4();
};

let Login = async (body) => {
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }
  ["userEmail", "userPassword"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let findData = {};
  findData["$or"] = [{ userEmail: { $eq: body.userEmail } }];
  findData["$and"] = [{ userPassword: { $eq: md5(body.userPassword) } }];
  let user = await UserModel.findOne({ where: findData, raw: true });

  if (!user) {
    throw new BadRequestError("Please check your credentials");
  }
  if (user.userStatus == "Active") {
    let authToken = await generateAuthToken(user.userMobile);
    await UserModel.update(
      { userSecurityToken: authToken },
      { where: { userID: user.userID }, raw: true }
    );
    let industry = await IndustryModel.findOne({
      where: { industryID: user.industryID },
      raw: true,
    });
    if (industry) {
      user.industryName = industry.industryName;
    }
    user.userProfilePicture =
      config.upload_folder +
      config.upload_entities.user_profile_image_folder +
      user.userProfilePicture;
    return user;
  } else {
    throw new BadRequestError("Ask admin for permission");
  }
};

let register = async (body) => {
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }
  [
    "userFirstName",
    "userLastName",
    "userEmail",
    "userPassword",
    "userMobile",
    "industryID",
    "userJobDescription",
    "userType",
  ].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let userEmailExit = await UserModel.findOne({
    where: { userEmail: body.userEmail.trim(), userVerified: "Yes" },
    attributes: ["userID", "userMobile"],
  });

  if (userEmailExit) {
    throw new BadRequestError("Email already exists");
  }

  let userMobileExist = await UserModel.findOne({
    where: {
      userMobile: { $like: `%${body.userMobile.trim()}%` },
      userVerified: "Yes",
    },
    attributes: ["userID", "userMobile"],
  });

  if (userMobileExist) {
    throw new BadRequestError("Mobile number alreay exists");
  }

  let otp = Math.floor(100000 + Math.random() * 900000);

  let user = await UserModel.findOne({
    where: { userEmail: body.userEmail.trim() },
    attributes: ["userID", "userMobile"],
  });

  if (user) {
    let updateData = {};
    let optionalFiled = [
      "userFirstName",
      "userLastName",
      "industryID",
      "userJobDescription",
      "userType",
    ];
    optionalFiled.forEach((x) => {
      if (body[x]) {
        updateData[x] = body[x];
      }
    });
    updateData["userOTP"] = otp.toString();
    updateData["userPassword"] = md5(body.userPassword.trim());
    await UserModel.update(updateData, {
      where: { userID: user.userID },
      raw: true,
    });
    return UserModel.findOne({ where: { userID: user.userID }, raw: true });
  } else {
    let createData = {
      userFirstName: body.userFirstName.trim(),
      userLastName: body.userLastName.trim(),
      userEmail: body.userEmail.trim(),
      userMobile: body.userMobile.trim(),
      userPassword: md5(body.userPassword.trim()),
      industryID: body.industryID,
      userJobDescription: body.userJobDescription,
      userType: body.userType,
      userOTP: otp.toString(),
    };
    return await UserModel.create(createData);
  }
};

let VerifyOtp = async (body) => {
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }
  ["userEmail", "otp"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });
  let user = await UserModel
    // .findOne({ where: { userEmail: body.userEmail.trim(), userOTP: body.otp.trim()} , raw: true });
    .findOne({ where: { userEmail: body.userEmail.trim() }, raw: true });
  if (!user) {
    //error
    throw new BadRequestError("User does not exist");
  }

  // if (user.userOTP != body.otp) {
  //     //error
  //     throw new BadRequestError("check your otp")
  // }

  if (body.otp != "123456") {
    //error
    throw new BadRequestError("Check again your otp");
  }

  // token generate
  let authToken = await generateAuthToken(body.userEmail);
  await UserModel.update(
    { userSecurityToken: authToken, userVerified: "Yes", userOTP: "" },
    { where: { userID: user.userID }, raw: true }
  );
  return { token: authToken };
};

let ResendOtp = async (body) => {
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }
  ["userEmail"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });
  let user = await UserModel.findOne({
    where: { userEmail: body.userEmail.trim() },
    raw: true,
  });
  if (!user) {
    //error
    throw new BadRequestError("User does not exist");
  }

  let otp = Math.floor(100000 + Math.random() * 900000);
  await UserModel.update(
    { userOTP: otp, userVerified: "No" },
    { where: { userID: user.userID }, raw: true }
  );
  return { otp: otp };
};

let ForgetPassword = async (body) => {
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }
  ["userEmail"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });
  let user = await UserModel.findOne({
    where: { userEmail: body.userEmail.trim() },
    raw: true,
  });
  if (!user) {
    //error
    throw new BadRequestError("User does not exist");
  }
  let otp = Math.floor(100000 + Math.random() * 900000);
  await UserModel.update(
    { userOTP: otp },
    { where: { userEmail: body.userEmail.trim() }, raw: true }
  );

  return {
    messge: "OTP has been sent successfully to registerd email",
    otp: otp,
  };
};

let SetNewPassword = async (req) => {
  let body = req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }
  ["userEmail", "userPassword"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });
  let user = await UserModel.findOne({
    where: {
      userEmail: body.userEmail.trim(),
      userSecurityToken: req.headers.token,
    },
    raw: true,
  });
  if (!user) {
    //error
    throw new BadRequestError("User does not exist");
  }
  let authToken = await generateAuthToken(body.userEmail);
  await UserModel.update(
    {
      userPassword: md5(body.userPassword.trim()),
      userSecurityToken: authToken,
      userOTP: "",
    },
    { where: { userEmail: body.userEmail.trim() }, raw: true }
  );

  return { token: authToken };
};

let changePassword = async (adminid, req_body) => {
  if (helper.undefinedOrNull(req_body)) {
    throw new BadRequestError("Request body comes empty");
  }

  if (helper.undefinedOrNull(req_body.new_password)) {
    throw new BadRequestError("New Password is required");
  }
  if (helper.undefinedOrNull(req_body.old_password)) {
    throw new BadRequestError("Old Password is required");
  }
  let user = await UserModel.findOne({
    where: { password: md5(req_body.old_password), id: adminid },
    attributes: ["id", "email"],
    raw: true,
  });
  if (!user) {
    throw new BadRequestError("no user found");
  }

  await UserModel.update(
    { password: md5(req_body.new_password) },
    { where: { id: user.id }, raw: true }
  );
  return { userId: user.id };
};

let signout = async (adminid, authToken) => {
  if (!authToken) {
    throw new BadRequestError("authToken is required");
  }
  await UserModel.update(
    { token: null },
    { where: { id: adminid }, raw: true }
  );
  return true;
};

let ProfileSetup = async (body) => {
  try {
    if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("body_empty");
    }
    if (!body?.vocationID?.length) {
      throw new BadRequestError("Please select atleast one vocation.");
    }
    if (!body?.userOtherDetails) {
      throw new BadRequestError("User Other detail is required.");
    }
    if (!body?.userID) {
      throw new BadRequestError("UserID is required.");
    }
    let user = await UserModel.findOne({
      where: { userID: body.userID },
      raw: true,
    });
    if (!user) {
      //error
      throw new BadRequestError("User does not exist");
    }

    await UserVoctionModel.destroy({ where: { userID: body?.userID } });
    await UserSubVoctionModel.destroy({ where: { userID: body?.userID } });

    for (let i = 0; i < body?.vocationID?.length; i++) {
      await UserVoctionModel.create({
        userID: body?.userID,
        vocationID: body?.vocationID[i],
        uservocationStatus: 1,
      });
      let subvocationData = await SubVocationModel.findAll({
        where: {
          vocationID: body?.vocationID[i],
          subVocationStatus: "Active",
          subVocationID: { $in: body?.subVocationID },
        },
        raw: true,
      });
      for (let j = 0; j < subvocationData.length; j++) {
        await UserSubVoctionModel.create({
          userID: body?.userID,
          vocationID: subvocationData[j].vocationID,
          subvocationID: subvocationData[j].subVocationID,
        });
      }
    }

    let userVocations = await UserVoctionModel.findAll({
      where: { userID: body.userID },
      order: [["userID", "DESC"]],
      raw: true,
    });

    let vocationName = await VocationModal.findAll({
      where: { vocationID: userVocations.map((x) => x.vocationID) },
      order: [["vocationID", "DESC"]],
      raw: true,
    });

    let userSubVocations = await UserSubVoctionModel.findAll({
      where: { userID: body.userID },
      order: [["userID", "DESC"]],
      raw: true,
    });

    let subVocationName = await SubVoctionModel.findAll({
      where: { subvocationID: userSubVocations.map((x) => x.subvocationID) },
      order: [["subvocationID", "DESC"]],
      raw: true,
    });

    await UserModel.update(
      {
        userOtherDetails: body?.userOtherDetails.trim(),
        userProfileSetupStatus: "Yes",
      },
      { where: { userID: body.userID }, raw: true }
    );

    let result = [...vocationName, ...subVocationName];
    return { slides: result };
  } catch (err) {
    console.log(err);
  }
};

let UserUpdate = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }
  ["userFirstName", "userLastName", "industryID", "userJobDescription"].forEach(
    (x) => {
      if (!body[x]) {
        throw new BadRequestError(x + " is required");
      }
    }
  );
  let updateData = {};
  let optionalFiled = [
    "userFirstName",
    "userLastName",
    "industryID",
    "userJobDescription",
  ];
  optionalFiled.forEach((x) => {
    if (body[x]) {
      updateData[x] = body[x];
    }
  });
  if (req.file && req.file.path) {
    updateData["userProfilePicture"] = req.file.filename;
  }
  await UserModel.update(updateData, {
    where: { userID: req.params.userID },
    raw: true,
  });
  let user = await UserModel.findOne({
    where: { userID: req.params.userID },
    raw: true,
  });
  let industry = await IndustryModel.findOne({
    where: { industryID: user.industryID },
    raw: true,
  });
  user.industryName = industry.industryName;
  user.userProfilePicture =
    config.upload_folder +
    config.upload_entities.user_profile_image_folder +
    user.userProfilePicture;

  return { slides: user };
};

let CompanyDetails = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;

  ["userCompanyId"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let CompanyDetails = await CompanyModal.findOne({
    where: { companyId: body.userCompanyId },
    raw: true,
  });

  if (!CompanyDetails) {
    throw new BadRequestError("Company does not exist");
  }

  // get industry name
  let industry = await IndustryModel.findOne({
    where: { industryID: CompanyDetails.companyIndustries },
    raw: true,
  });

  if (CompanyDetails.companyLogo) {
    CompanyDetails.companyLogo = `${process.env.BASE_URL}/${config.upload_folder}/${config.upload_entities.compnay_image_folder}/${CompanyDetails.companyLogo}`;
  }

  return {
    ...CompanyDetails,
    companyIndustries: +CompanyDetails?.companyIndustries,
    industryName: industry?.industryName,
  };
};

let updateCompanyDetails = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;

  [
    "companyName",
    "companyIndustries",
    "companyWebsite",
    "companyEmail",
    "companyAbout",
    "companyEmployeesNo",
    "companyFounders",
    "companyOperatingStatus",
  ].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  if (req.file && req.file.path) {
    body["companyLogo"] = req.file.filename;
  }
  await CompanyModal.update(body, {
    where: { companyId: req.params.companyId },
    raw: true,
  });
  let company = await CompanyModal.findOne({
    where: { companyId: req.params.companyId },
    raw: true,
  });
  let industry = await IndustryModel.findOne({
    where: { industryID: company.companyIndustries },
    raw: true,
  });

  company.companyIndustries = industry?.industryName;
  company.companyLogo =
    config.upload_folder +
    config.upload_entities.company_logo_folder +
    company.companyLogo;

  return { company };
};

let getUserFollowers = async (req) => {
  // id from  req params
  const userID = req.params.userID;

  let userFollowers = await userFollowModal.findAll({
    where: { userID },
    raw: true,
  });
  let user = await UserModel.findOne({
    where: { userID },
    raw: true,
  });
  let followers = await UserModel.findAll({
    where: { userID: userFollowers.map((x) => x.userfollowUserID) },
    raw: true,
  });
  followers.forEach((x) => {
    x.userProfilePicture =
      config.upload_folder +
      config.upload_entities.user_profile_image_folder +
      x.userProfilePicture;

    x.isFollow = true;
  });
  return { followers };
};

const unfollowUser = async (req) => {
  const body = req.body.body ? JSON.parse(req.body.body) : req.body;
  ["userID", "userfollowUserID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  await userFollowModal.destroy({
    where: {
      [Op.and]: [
        { userID: body.userID },
        { userfollowUserID: body.userfollowUserID },
      ],
    },
    raw: true,
  });
  return {
    message: "unfollowed",
  };
};

const followUser = async (req) => {
  const body = req.body.body ? JSON.parse(req.body.body) : req.body;
  ["userID", "userfollowUserID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  await userFollowModal.create({
    userID: body.userID,
    userfollowUserID: body.userfollowUserID,
  });
  return {
    message: "followed",
  };
};

module.exports = {
  Login: Login,
  signout: signout,
  changePassword: changePassword,
  register: register,
  VerifyOtp: VerifyOtp,
  ResendOtp: ResendOtp,
  ForgetPassword: ForgetPassword,
  SetNewPassword: SetNewPassword,
  ProfileSetup: ProfileSetup,
  UserUpdate: UserUpdate,
  CompanyDetails,
  updateCompanyDetails,
  getUserFollowers,
  unfollowUser,
  followUser,
};
