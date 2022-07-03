let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const UsersModal = sequelize_mysql.define(
  "users",
  {
    userID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userFirstName: {
      type: Sequelize.STRING,
    },
    userLastName: {
      type: Sequelize.STRING,
    },
    userCountryCode: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    userMobile: {
      type: Sequelize.STRING,
    },
    userEmail: {
      type: Sequelize.STRING,
    },
    userPassword: {
      type: Sequelize.STRING,
    },
    industryID: {
      type: Sequelize.INTEGER,
    },
    userProfilePicture: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    userCoverPhoto: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    languageID: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    userDeviceType: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    userDeviceID: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    userReferKey: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    userVerified: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "No",
    },
    userOTP: {
      type: Sequelize.STRING,
    },
    userSignupOTPVerified: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "No",
    },
    userJobDescription: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    userOtherDetails: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    userNewQuestion: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "Yes",
    },
    userNewJob: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "Yes",
    },
    userNewPost: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "Yes",
    },
    userAssignmentNotify: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "Yes",
    },
    userFollowRequest: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "Yes",
    },
    userCommentsReplies: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "Yes",
    },
    userStatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Inactive"],
      defaultValue: "Active",
    },
    userProfileSetupStatus: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "No",
    },
    userType: {
      type: Sequelize.ENUM,
      values: ["Professional", "HR", "Advertisers"],
      defaultValue: null,
    },
    userApproved: {
      type: Sequelize.ENUM,
      values: ["Pending", "Approved", "Approved"],
      defaultValue: null,
    },
    userCreatedDate: {
      type: Sequelize.DATE,
      defaultValue: () => new Date(),
    },
    userSecurityToken: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    useTokenExpirtyDate: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
    userCompanyId: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    userDocumentVerified: {
      type: Sequelize.ENUM,
      values: ["Yes", "No"],
      defaultValue: "No",
    },
    userStateCode: {
      type: Sequelize.STRING,
    },
    userCityCode: {
      type: Sequelize.STRING,
    },
    userGst: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    userPan: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
  },
  {
    freezeTableName: true,
    tableName: "users",
  }
);

module.exports = UsersModal;
