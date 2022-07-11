"use strict";
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionModal = sequelize_mysql.define(
  "questions",
  {
    queID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    queQuestion: {
      type: Sequelize.STRING,
    },
    queDescription: {
      type: Sequelize.STRING,
    },
    queMode: {
      type: Sequelize.ENUM,
      values: ["Draft", "Published"],
      defaultValue: "Draft",
    },
    queType: {
      type: Sequelize.ENUM,
      values: ["Question", "Post"],
      defaultValue: NONE,
    },
    queStatus: {
      type: Sequelize.ENUM,
      values: ["Active", "Inactive", "Archived", "Voilated"],
      defaultValue: "Active",
    },
    queAnswerCount: {
      type: Sequelize.NUMBER,
      defaultValue: 0,
    },
    queLikeCount: {
      type: Sequelize.NUMBER,
      defaultValue: 0,
    },
    queDislikeCount: {
      type: Sequelize.NUMBER,
      defaultValue: 0,
    },
    queBookmarkCount: {
      type: Sequelize.NUMBER,
      defaultValue: 0,
    },
    userID: {
      type: Sequelize.NUMBER,
    },
    queCreatedDate: {
      type: Sequelize.DATE,
      defaultValue: () => new Date(),
    },
    vocationID: {
      type: Sequelize.NUMBER,
    },
  },
  {
    freezeTableName: true,
    tableName: "questions",
  }
);

module.exports = QuestionModal;
