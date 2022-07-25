'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const AnswerReplyUnlikeModal = sequelize_mysql.define("answerreplyldisike",
    {
        answerreplydislikeID :{
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
        tableName: 'answerreplyldisike'
    }
);

module.exports = AnswerReplyUnlikeModal;

