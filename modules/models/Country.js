'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const CountryModal = sequelize_mysql.define("country",
    {
        countryID  :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        countryName :{
            type: Sequelize.STRING
        },
        countryCode :{
            type: Sequelize.INTEGER,
            defaultValue : 0
        },
        countryRemarks: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        countryStatus: {
            type: Sequelize.ENUM,
            values: ['Active', 'Inactive'],
            defaultValue : 'Active'
        },
        countryCreatedDate: {
            type: Sequelize.DATE
        },
        countryShortName :{
            type: Sequelize.STRING
        },
        countryFlagImage :{
            type: Sequelize.STRING
        },
        countryCurrency :{
            type: Sequelize.STRING,
            defaultValue : null
        }
    },
    {
        freezeTableName: true,
        tableName: 'country'
    }
);

module.exports = CountryModal;

