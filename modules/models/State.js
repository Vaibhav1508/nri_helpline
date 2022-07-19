"use strict";
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const StateModal = sequelize_mysql.define(
  "state",
  {
    stateID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    countryID: {
      type: Sequelize.INTEGER,
    },
    stateName: {
      type: Sequelize.STRING,
    },
    stateRemarks: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    stateStatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Inactive"],
    },
    stateCreatedDate: {
      type: Sequelize.DATE,
    },
  },
  {
    freezeTableName: true,
    tableName: "state",
  }
);

module.exports = StateModal;
