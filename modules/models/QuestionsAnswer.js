'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionsAnswerModal = sequelize_mysql.define("queanswes",
    {
        answerID :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        queID:{
            type: Sequelize.NUMBER
        },
        userID: {
            type: Sequelize.NUMBER
        },
        answerAnswer: {
            type: Sequelize.STRING
        },
        answerCreatedDate: {
            type: Sequelize.DATE,
            defaultValue: () => new Date(),
        }
    },
    {
        freezeTableName: true,
        tableName: 'queanswes'
    }
);

module.exports = QuestionsAnswerModal;

