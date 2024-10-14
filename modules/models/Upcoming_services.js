'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const UpcomingServicesModal = sequelize_mysql.define("tbl_upcoming_services",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        v_name:{
            type: Sequelize.STRING
        },
        v_color_code: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        v_icon_image: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        t_description: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        v_feedback_title1: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        v_feedback_title2: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        i_order : {
            type: Sequelize.INTEGER,
        },
        e_status: {
            type: Sequelize.ENUM,
            values: ['Active', 'Inactive'],
            defaultValue : 'Active'
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
        tableName: 'tbl_upcoming_services'
    }
);

module.exports = UpcomingServicesModal;

