'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const SubVocationModal = sequelize_mysql.define("subvocations",
    {
        subVocationID :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        vocationID:{
            type: Sequelize.STRING
        },
        subVocationName:{
            type: Sequelize.STRING
        },
        subVocationImage: {
            type: Sequelize.STRING
        },
        subVocationRemarks: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        subVocationStatus: {
            type: Sequelize.ENUM,
            values: ['Active', 'Inactive'],
            defaultValue : 'Active'
        }
    },
    {
        freezeTableName: true,
        tableName: 'subvocations'
    }
);

module.exports = SubVocationModal;

