'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("tbl_superadmin",
    {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        v_name: {
            type: Sequelize.STRING,            
        },
        v_email: {
            type: Sequelize.STRING,            
        },
        v_image: {
            type: Sequelize.STRING,
            defaultValue : null            
        },
        email_verified_at: {
            type: Sequelize.DATE          
        },
        password:{
            type: Sequelize.STRING,
        },
        v_password_token: {
            type: Sequelize.STRING,
        },
        remember_token: {
            type: Sequelize.STRING,
        },
        v_forgot_passwod_code: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        api_token :{
            type: Sequelize.STRING,
        },
        e_status : {
            type: Sequelize.ENUM,
            values: ["Active", "Inactive"],
            defaultValue: "Active",
        },
        e_type: {
            type: Sequelize.ENUM,
            values: ['Admin'],
            defaultValue : 'Admin'
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: ()=>new Date()
        },
        updated_at: {
            type: Sequelize.DATE,
            defaultValue: null
        }
    },
    {
        freezeTableName: true,
        tableName: 'tbl_superadmin'
    }
);


