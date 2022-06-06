'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("admin",
    {
        Admin_ID:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Admin_Name: {
            type: Sequelize.STRING,            
        },
        Admin_Email: {
            type: Sequelize.STRING,            
        },
        Admin_Mobile: {
            type: Sequelize.STRING,
            defaultValue : null            
        },
        Admin_Password: {
            type: Sequelize.STRING,
            unique: true            
        },
        Admin_Type: {
            type: Sequelize.STRING,            
        },
        Admin_Address: {
            type: Sequelize.STRING,
            defaultValue : null            
        },
        Admin_Status: {
            type: Sequelize.STRING, 
        },
        Admin_Last_Login: {
            type: Sequelize.DATE,          
            defaultValue: ()=>new Date()
        },
        Created_Date: {
            type: Sequelize.DATE,
            defaultValue: ()=>new Date()
        },
        Admin_Code_Reset_Password: {
            type: Sequelize.STRING, 
        },
        Admin_Exp_CRP: {
            type: Sequelize.STRING, 
        }
    },
    {
        freezeTableName: true,
        tableName: 'admin'
    }
);


