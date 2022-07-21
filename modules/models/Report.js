"use strict";
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const ReportModal = sequelize_mysql.define(
  "report",
  {
    reportedID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    queID: {
      type: Sequelize.INTEGER,
    },
    userID: {
      type: Sequelize.INTEGER,
    },
    questatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Inactive"],
    },
    reasonID: {
      type: Sequelize.INTEGER,
    },
    description: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: () => new Date(),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: () => new Date(),
    },
  },
  {
    freezeTableName: true,
    tableName: "reportedquestion",
  }
);

module.exports = ReportModal;
