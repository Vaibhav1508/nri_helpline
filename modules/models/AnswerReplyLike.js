'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const AnswerReplyLikeModal = sequelize_mysql.define("answerreplylike",
    {
        answerreplylikeID  :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        replyID:{
            type: Sequelize.NUMBER
        },
        userID: {
            type: Sequelize.NUMBER
        }
    },
    {
        freezeTableName: true,
        tableName: 'answerreplylike'
    }
);

module.exports = AnswerReplyLikeModal;

