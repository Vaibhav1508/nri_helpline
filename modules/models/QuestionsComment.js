'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionsCommentModal = sequelize_mysql.define("quecomment",
    {
        queCommentID :{
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
        queComment: {
            type: Sequelize.STRING
        },
        queCreatedDate: {
            type: Sequelize.DATE,
            defaultValue: () => new Date(),
        }
    },
    {
        freezeTableName: true,
        tableName: 'quecomment'
    }
);

module.exports = QuestionsCommentModal;

