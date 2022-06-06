'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const IndustryModal = sequelize_mysql.define("industry",
    {
        industryID  :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        industryName :{
            type: Sequelize.STRING
        },
        industryRemarks: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        industryStatus: {
            type: Sequelize.ENUM,
            values: ['Active', 'Inactive'],
            defaultValue : 'Active'
        },
        industryCreatedDate: {
            type: Sequelize.DATE
        }
    },
    {
        freezeTableName: true,
        tableName: 'industry'
    }
);

module.exports = IndustryModal;

