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
    },
    companyCoverPhoto: {
      type: Sequelize.STRING,
    },
    companyTagline: {
      type: Sequelize.STRING,
    },
    companyWebsite: {
      type: Sequelize.STRING,
    },
    companyAbout: {
      type: Sequelize.STRING,
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
    },
    companyTwiterUrl: {
      type: Sequelize.STRING,
    },
    companyStatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Inactive"],
      defaultValue: "Active",
    },
    companyLocations: {
      type: Sequelize.STRING,
    },
    companyFounders: {
      type: Sequelize.STRING,
    },
    companyIndustries: {
      type: Sequelize.STRING,
    },
    companyCreatedDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    companyStreet2: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    companyPincode: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    companyPhoneNumber: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    companyOperatingHours: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "company",
    freezeTableName: true,
  }
);

module.exports = CompanyModal;
