'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionaAnswerUnlikeModal = sequelize_mysql.define("answerdislikes",
    {
        answerdislikeID :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        answerID:{
            type: Sequelize.NUMBER
        },
        userID: {
            type: Sequelize.NUMBER
        }
    },
    {
        freezeTableName: true,
        tableName: 'answerdislikes'
    }
);

module.exports = QuestionaAnswerUnlikeModal;

