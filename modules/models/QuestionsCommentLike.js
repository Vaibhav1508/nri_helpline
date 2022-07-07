'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionaCommentLikeModal = sequelize_mysql.define("quecommentlikes",
    {
        quecommentlikeID :{
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
        tableName: 'quecommentlikes'
    }
);

module.exports = QuestionaCommentLikeModal;

