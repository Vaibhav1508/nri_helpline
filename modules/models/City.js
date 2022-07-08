"use strict";
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const CityModal = sequelize_mysql.define(
  "city",
  {
    cityID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    countryID: {
      type: Sequelize.INTEGER,
    },
    stateID: {
      type: Sequelize.INTEGER,
    },
    cityName: {
      type: Sequelize.STRING,
    },
    cityRemarks: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    cityStatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Inactive"],
    },
    cityCreatedDate: {
      type: Sequelize.DATE,
    },
    cityLatitude: {
      type: Sequelize.STRING,
      defaultValue: "0.0",
    },
    cityLongitude: {
      type: Sequelize.STRING,
      defaultValue: "0.0",
    },
  },
  {
    freezeTableName: true,
    tableName: "city",
  }
);

module.exports = CityModal;
