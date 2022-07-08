"use strict";
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const UserSubVocationModel = sequelize_mysql.define(
  "usersubvocation",
  {
    usersubvocationID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userID: {
      type: Sequelize.INTEGER,
    },
    vocationID: {
      type: Sequelize.INTEGER,
    },
    subvocationID: {
      type: Sequelize.INTEGER,
    },
    usersubvocationStatus: {
      type: Sequelize.ENUM,
      values: ["Following", "Unfollowed"],
    },
  },
  {
    freezeTableName: true,
    tableName: "usersubvocation",
  }
);

module.exports = UserSubVocationModel;
