"use strict";
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const ReasonsModal = sequelize_mysql.define(
  "reasons",
  {
    reasonID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reasonName: {
      type: Sequelize.STRING,
    },
    reasonDescription: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    reasonStatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Inactive"],
      defaultValue: "Active",
    },
  },
  {
    freezeTableName: true,
    tableName: "reasons",
  }
);

module.exports = ReasonsModal;
