'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionLikeModal = sequelize_mysql.define("quelikes",
    {
        quelikeID :{
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
        tableName: 'quelikes'
    }
);

module.exports = QuestionLikeModal;

