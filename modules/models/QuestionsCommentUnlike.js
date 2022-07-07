'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionaCommentUnlikeModal = sequelize_mysql.define("quecommentdislikes",
    {
        quecommentdislikeID :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        queCommentID:{
            type: Sequelize.NUMBER
        },
        userID: {
            type: Sequelize.NUMBER
        }
    },
    {
        freezeTableName: true,
        tableName: 'quecommentdislikes'
    }
);

module.exports = QuestionaCommentUnlikeModal;

