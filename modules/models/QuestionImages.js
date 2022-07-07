'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const { NONE } = require("sequelize");

const QuestionImagesModel = sequelize_mysql.define("queimages",
    {
        queImageID   :{
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
        image: {
            type: Sequelize.STRING
        }
    },
    {
        freezeTableName: true,
        tableName: 'queimages'
    }
);

module.exports = QuestionImagesModel;

