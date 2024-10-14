'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

module.exports = sequelize_mysql.define("tbl_users",
    {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        v_full_name: {
            type: Sequelize.STRING,            
        },
        v_mobile_number: {
            type: Sequelize.STRING,            
        },
        v_india_phone: {
            type: Sequelize.STRING,
        },
        v_email: {
            type: Sequelize.STRING,            
        },
        v_profile_image: {
            type: Sequelize.STRING,
            defaultValue : null            
        },
        i_country_id: {
            type: Sequelize.INTEGER,
        },
        i_other_country_id: {
            type: Sequelize.INTEGER,
        },
        i_state_id : {
            type: Sequelize.INTEGER,
        },
        i_city_id : {
            type: Sequelize.INTEGER,
        },
        i_profession_id : {
            type: Sequelize.INTEGER,
        },
        v_since_year : {
            type: Sequelize.STRING,
        },
        v_otp: {
            type: Sequelize.STRING,
        },
        e_device_type: {
            type: Sequelize.ENUM,
            values: ["Ios", "Android"],
            defaultValue: "Android",
        },
        v_device_token: {
            type: Sequelize.STRING
        },
        v_api_token : {
            type: Sequelize.STRING
        }, 
        e_status : {
            type: Sequelize.ENUM,
            values: ["Active", "Inactive"],
            defaultValue: "Active",
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
        tableName: 'tbl_users'
    }
);


