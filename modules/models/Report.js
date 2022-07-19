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
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn("NOW"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn("NOW"),
    },
  },
  {
    freezeTableName: true,
    tableName: "reportedquestion",
  }
);

module.exports = ReportModal;
