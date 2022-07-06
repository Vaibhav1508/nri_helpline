let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const CompanyModal = sequelize_mysql.define(
  "company",
  {
    companyID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyName: {
      type: Sequelize.STRING,
    },
    companyLogo: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    companyCoverPhoto: {
      type: Sequelize.STRING,
      default: null,
    },
    companyTagline: {
      type: Sequelize.STRING,
      default: null,
    },
    companyWebsite: {
      type: Sequelize.STRING,
      default: null,
    },
    companyAbout: {
      type: Sequelize.STRING,
      default: null,
    },
    companyOperatingStatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Not Active"],
      defaultValue: "Active",
    },
    companyEmployeesNo: {
      type: Sequelize.SMALLINT,
    },
    companyEmail: {
      type: Sequelize.STRING,
    },
    companyFBUrl: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    companyTwiterUrl: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    companyStatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Inactive"],
      defaultValue: "Active",
    },
    companyLocations: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    companyFounders: {
      type: Sequelize.STRING,
      dafaultValue: null,
    },
    companyIndustries: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    companyCreatedDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    companyStreet2: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    companyPincode: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    companyPhoneNumber: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    companyOperatingHours: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
  },
  {
    tableName: "company",
    freezeTableName: true,
  }
);

module.exports = CompanyModal;
