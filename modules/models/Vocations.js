'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const VocationsModal = sequelize_mysql.define("vocation",
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
        },
        relatedVocations: {
            type: Sequelize.JSON,
            defaultValue : null
        }
    },
    {
        freezeTableName: true,
        tableName: 'vocation'
    }
);

module.exports = VocationsModal;

