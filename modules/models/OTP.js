'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("otp",
    {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        phone: {
            type: Sequelize.STRING
        },
        country: {
            type: Sequelize.STRING
        },
        otp: {
            type: Sequelize.INTEGER
        },       
    },
    {
        freezeTableName: true,
        tableName: 'otp'
    }
);


