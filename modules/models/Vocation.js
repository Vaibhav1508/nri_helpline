'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const VocationModal = sequelize_mysql.define("vocations",
    {
        vocationID :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        vocationName:{
            type: Sequelize.STRING
        },
        vocationImage: {
            type: Sequelize.STRING
        },
        vocationRemarks: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        vocationStatus: {
            type: Sequelize.ENUM,
            values: ['Active', 'Inactive'],
            defaultValue : 'Active'
        }
    },
    {
        freezeTableName: true,
        tableName: 'vocations'
    }
);

module.exports = VocationModal;

