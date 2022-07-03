'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionUnlikeModal = sequelize_mysql.define("quedislikes",
    {
        quedislikeID  :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        queID:{
            type: Sequelize.NUMBER
        },
        userID: {
            type: Sequelize.NUMBER
        }
    },
    {
        freezeTableName: true,
        tableName: 'quedislikes'
    }
);

module.exports = QuestionUnlikeModal;

