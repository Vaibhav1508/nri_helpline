'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionsAnswersReplyModal = sequelize_mysql.define("answerreply",
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
        tableName: 'answerreply'
    }
);

module.exports = QuestionsAnswersReplyModal;

