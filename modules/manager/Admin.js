"use strict";

let helper = require("../helpers/helpers"),
  _ = require("lodash"),
  md5 = require("md5"),
  AdminModel = require("../models/Admin"),
  UsersModel = require("../models/Users"),
  IndustryModel = require("../models/Industry"),
  BadRequestError = require("../errors/badRequestError");
const { v4: uuidv4 } = require("uuid");
const CompanyModel = require("../models/Company");
const mailer = require("../helpers/mail.Helper");
const config = require("../../config/config");

let generateAuthToken = async (phone) => {
  return uuidv4();
};

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

  let findData = {};
  findData["$or"] = [{ Admin_Email: { $eq: body.userEmail } }];
  findData["$and"] = [{ Admin_Password: { $eq: md5(body.userPassword) } }];
  let user = await AdminModel.findOne({
    where: findData,
    attributes: ["Admin_ID", "Admin_Mobile"],
    raw: true,
  });

  if (!user) {
    throw new BadRequestError("Please check your credentials again");
  }

  let authToken = await generateAuthToken(user.Admin_Mobile);
  await AdminModel.update(
    { token: authToken },
    { where: { Admin_ID: user.Admin_ID } }
  );

  return {
    token: authToken,
    login: true,
  };
};

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
  console.log(body);
  let limit = body.limit ? parseInt(body.limit) : 10;
  let page = body.page || 1;
  let offset = (page - 1) * limit;
  let findData = {
    userType: "Professional",
  };
  if (body.filters) {
    if (body.filters.searchtext) {
      findData["$or"] = [
        { userFirstName: { $like: "%" + body.filters.searchtext + "%" } },
        { userLastName: { $like: "%" + body.filters.searchtext + "%" } },
      ];
    }
  }
  let allUser = await UsersModel.findAll({
    where: findData,
    limit,
    offset,
    order: [["userID", "DESC"]],
    raw: true,
  });
  for (let i = 0; i < allUser.length; i++) {
    let IndustryName = await IndustryModel.findOne(
      { where: { industryID: allUser[i].industryID } },
      {
        raw: true,
      }
    );
    allUser[i].industryName = IndustryName?.industryName || "";
  }
  let allUserCount = await UsersModel.count({
    where: findData,
    order: [["userID", "DESC"]],
    raw: true,
  });
  let _result = { total_count: 0 };
  _result.slides = allUser;
  _result.total_count = allUserCount;
  return _result;
};

let UsersDetail = async (req) => {
  if (!req.params.userID) {
    throw new BadRequestError("UserID is required");
  }
  let userData = await UsersModel.findOne({
    where: { userID: req.params.userID },
    raw: true,
  });
  let IndustryName = await IndustryModel.findOne(
    { where: { industryID: userData.industryID } },
    {
      raw: true,
    }
  );
  userData.industryName = IndustryName?.industryName || "";
  return { data: userData };
};

let UserUpdate = async (req) => {
  try {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("body_empty");
    }
    [
      "userFirstName",
      "userLastName",
      "userEmail",
      "userMobile",
      "industryID",
      "userJobDescription",
    ].forEach((x) => {
      if (!body[x]) {
        throw new BadRequestError(x + " is required");
      }
    });
    let updateData = {};
    let optionalFiled = [
      "userFirstName",
      "userLastName",
      "userEmail",
      "userMobile",
      "industryID",
      "userJobDescription",
    ];
    optionalFiled.forEach((x) => {
      if (body[x]) {
        updateData[x] = body[x];
      }
    });
    await UsersModel.update(updateData, {
      where: { userID: req.params.userID },
      raw: true,
    });
    let user = await UsersModel.findOne({
      where: { userID: req.params.userID },
      raw: true,
    });

    return { slides: user };
  } catch (err) {
    console.log(err);
  }
};

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

  let user = await UsersModel.findOne({
    where: { userID: body.userID },
    raw: true,
  });
  if (!user) {
    throw new BadRequestError("Please check your credentials again");
  }
  if (user.userStatus == "Active" && body.status == 1) {
    throw new BadRequestError("Already activated");
  }
  if (user.userStatus == "Inactive" && body.status != 1) {
    throw new BadRequestError("Already inactivated");
  }
  let status = body.status == 1 ? "Active" : "Inactive";
  await UsersModel.update(
    { userStatus: status },
    {
      where: { userID: user.userID },
      attributes: ["Admin_ID", "Admin_Mobile"],
      raw: true,
    }
  );
  return { status: body.status };
};

let craeateBusinessAssociate = async (req) => {
  try {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;

    [
      "companyName",
      "userFirstName",
      "userEmail",
      "userMobile",
      "languageID",
      "streetAddress",
      "companyPincode",
      "userCountryCode",
      "userStateCode",
      "userCityCode",
    ].forEach((x) => {
      if (!body[x]) {
        throw new BadRequestError(x + " is required");
      }
    });

    // create company
    let company = await CompanyModel.create({
      companyName: body.companyName,
      companyEmail: body.userEmail,
      companyLocations: body.streetAddress,
      companyStreet2: body.streetAddress2 ? body.streetAddress2 : "",
      companyPincode: body.companyPincode ? body.companyPincode : "",
      companyPhoneNumber: body.companyPhoneNumber
        ? body.companyPhoneNumber
        : "",
    });

    // create hr
    let hr = await UsersModel.create({
      ...body,
      userLastName: "",
      userPassword: md5("123456"),
      userType: "HR",
      userStatus: "Active",
      userCompanyId: company.companyID,
    });

    // send mail
    let mailData = {
      to: body.userEmail,
      subject: "Welcome to Vocation",
      html: `<div>
      <h1>Welcome to Vocation</h1>
      <p>
        Hi ${body.userFirstName},<br />
        <br />
        Welcome to Vocation. You have successfully registered as a Business Associate.
        
        <br />
        Your Password to login into app is 123456.
        `,
    };

    await mailer.sendMail(mailData);

    return { status: true };
  } catch (err) {
    console.log(err);
    throw new BadRequestError(err.errors);
  }
};

let AssociateUpdate = async (req) => {
  try {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;

    [
      "companyName",
      "userFirstName",
      "userEmail",
      "userMobile",
      "languageID",
      "streetAddress",
      "userCountryCode",
      "userStateCode",
      "userCityCode",
    ].forEach((x) => {
      if (!body[x]) {
        throw new BadRequestError(x + " is required");
      }
    });

    await UsersModel.update(body, {
      where: { userID: req.params.userID },
      raw: true,
    });
    let user = await UsersModel.findOne({
      where: { userID: req.params.userID },
      raw: true,
    });

    // update company details
    await CompanyModel.update(
      {
        companyName: body.companyName,
        companyEmail: body.userEmail,
        companyLocations: body.streetAddress,
        companyStreet2: body.streetAddress2 ? body.streetAddress2 : "",
        companyPincode: body.companyPincode ? body.companyPincode : "",
        companyPhoneNumber: body.companyPhoneNumber
          ? body.companyPhoneNumber
          : "",
      },
      {
        where: { companyID: user.userCompanyId },
        raw: true,
      }
    );

    return { slides: user };
  } catch (err) {
    console.log(err);
    throw new BadRequestError(err.errors);
  }
};

// get associate list
let getAssociateList = async (body) => {
  try {
    let limit = body.limit ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {};
    if (body.filters) {
      if (body.filters.searchtext) {
        findData["$or"] = [
          { userFirstName: { $like: "%" + body.filters.searchtext + "%" } },
        ];
      }
    }
    let associates = await UsersModel.findAll({
      where: {
        ...findData,
        userType: "HR",
      },
      limit,
      offset,
      order: [["userID", "DESC"]],
      raw: true,
    });

    // company list
    let companyList = await CompanyModel.findAll({
      raw: true,
    });

    const associateList = associates.map((x) => {
      let company = companyList.find((y) => y.companyID == x.userCompanyId);
      return {
        userID: x.userID,
        userFirstName: x.userFirstName,
        userLastName: x.userLastName,
        userEmail: x.userEmail,
        userMobile: x.userMobile,
        userCompanyId: x.userCompanyId,
        companyName: company?.companyName,
        companyStatus: company?.companyOperatingStatus,
        userStatus: x.userStatus,
        userVerified: x.userDocumentVerified,
      };
    });

    let _result = { total_count: 0 };
    _result.slides = associateList;
    _result.total_count = associateList.length;
    return _result;

    // return { data: associateList };
  } catch (error) {
    console.log(error);
  }
};

// get associate details
let getAssociateDetails = async (req) => {
  let user = await UsersModel.findOne({
    where: { userID: req.params.userID },
    raw: true,
  });
  let companyList = await CompanyModel.findAll({
    raw: true,
  });
  let company = companyList.find((x) => x.companyID == user.userCompanyId);

  return {
    ...user,
    streetAddress: company?.companyLocations,
    companyName: company?.companyName,
    streetAddress2: company?.companyStreet2,
    companyPincode: company?.companyPincode,
    companyPhoneNumber: company?.companyPhoneNumber,
    userGst: user.userGst
      ? `${process.env.BASE_URL}/${config.upload_folder}${config.upload_entities.hr_kyc_documents_folder}${user.userGst}`
      : "",
    userPan: user.userPan
      ? `${process.env.BASE_URL}/${config.upload_folder}${config.upload_entities.hr_kyc_documents_folder}${user.userPan}`
      : "",
  };
};

// upload kyc document
let uploadKycDocument = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  // get files from request
  let files = req.files;

  // get user id from request
  let userID = req.body.userID;
  let user = await UsersModel.findOne({
    where: { userID: userID },
    raw: true,
  });

  // set images in user details
  if (files.PAN) {
    let user = await UsersModel.findOne({
      where: { userID: userID },
      raw: true,
    });
    user.userPan = files.PAN[0].filename;
    user.isPanVerified = "Pending";
    user.userDocumentRejectionReason = null;
    await UsersModel.update(user, {
      where: { userID: userID },
    });
  }
  if (files.GST) {
    let user = await UsersModel.findOne({
      where: { userID: userID },
      raw: true,
    });
    user.userGst = files.GST[0].filename;
    user.isGstVerified = "Pending";
    user.userDocumentRejectionReason = null;
    await UsersModel.update(user, {
      where: { userID: userID },
    });
  }

  // send mail to notify that document is uploaded
  let mailData = {
    to: user.userEmail,
    subject: "KYC Document Uploaded",
    html: `<div>
    <h1>KYC Document Uploaded</h1>
    <p>
      Hi ${user.userFirstName},<br />
      <br />
      Your KYC document has been uploaded successfully.
      Please wait for the approval from the admin.
      `,
  };

  await mailer.sendMail(mailData);

  return { status: true };
};

// Approve and reject associate
let ApproveHr = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;

  // get user details
  let user = await UsersModel.findOne({
    where: { userID: body.userID },
    raw: true,
  });

  // update user details
  await UsersModel.update(
    {
      userDocumentVerified: "Yes",
    },
    {
      where: { userID: body.userID },
      raw: true,
    }
  );

  // send mail to notify that document is uploaded
  let mailData = {
    to: user.userEmail,
    subject: "KYC Document Approved",
    html: `
    <div>
    <h1>KYC Document Approved</h1>
    <p>
      Hi ${user.userFirstName},<br />
      <br />
      Your KYC document has been approved.
    </p>
    </div>
    `,
  };

  await mailer.sendMail(mailData);

  return { status: true };
};

let RejectHr = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;

  ["userID", "reason"].forEach((x) => {
    if (!body[x]) {
      throw new Error(`${x} is required`);
    }
  });

  // get user details
  let user = await UsersModel.findOne({
    where: { userID: body.userID },
    raw: true,
  });

  if (body.type == "GST" && body.status == "Rejected") {
    user.isGstVerified = "Rejected";
  }

  if (body.type == "PAN" && body.status == "Rejected") {
    user.isPanVerified = "Rejected";
  }

  if (body.type === "both" && body.status === "Rejected") {
    user.isGstVerified = "Rejected";
    user.isPanVerified = "Rejected";
  }

  // update user details
  await UsersModel.update(
    {
      ...user,
      userDocumentVerified: "No",
      userDocumentRejectionReason: body.reason,
    },
    {
      where: { userID: body.userID },
      raw: true,
    }
  );

  // send mail to notify that document is uploaded
  let mailData = {
    to: user.userEmail,
    subject: "KYC Document Rejected",
    html: `
    <div>
    <h1>KYC Document Rejected</h1>
    <p>
      Hi ${user.userFirstName},<br />
      <br />
      Your KYC document has been rejected.
      <br />
      <br />
      Reason: ${body.reason}
    </p>
    </div>
    `,
  };

  await mailer.sendMail(mailData);

  return { status: true };
};

// approve and reject single document Gst or Pan
const approveRejectSingleDocument = async (req) => {
  try {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;

    let user = await UsersModel.findOne({
      where: { userID: body.userID },
      raw: true,
    });

    if (body.type == "GST" && body.status == "Approved") {
      user.isGstVerified = "Approved";
    }
    if (body.type == "PAN" && body.status == "Approved") {
      user.isPanVerified = "Approved";
    }

    await UsersModel.update(user, {
      where: { userID: body.userID },
    });

    user = await UsersModel.findOne({
      where: { userID: body.userID },
      raw: true,
    });

    if (user.isGstVerified == "Approved" && user.isPanVerified == "Approved") {
      await UsersModel.update(
        {
          userDocumentVerified: "Yes",
        },
        {
          where: { userID: body.userID },
          raw: true,
        }
      );

      // mail for user that document is approved
      let mailData = {
        to: user.userEmail,
        subject: "KYC Document Approved",
        html: `
          <div>
          <h1>KYC Document Approved</h1>
          <p>
            Hi ${user.userFirstName},<br />
            <br />
            Your KYC document has been approved.
          </p>
          </div>
          `,
      };
      await mailer.sendMail(mailData);
    }

    return { status: true };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  Login: Login,
  UsersList: UsersList,
  ChangeUserStatus: ChangeUserStatus,
  UsersDetail: UsersDetail,
  UserUpdate: UserUpdate,
  craeateBusinessAssociate: craeateBusinessAssociate,
  getAssociateList,
  AssociateUpdate,
  getAssociateDetails,
  uploadKycDocument,
  ApproveHr,
  RejectHr,
  approveRejectSingleDocument,
};
