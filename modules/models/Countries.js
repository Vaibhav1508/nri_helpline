'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const SliderModal = sequelize_mysql.define("tbl_countries",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        v_name:{
            type: Sequelize.STRING
        },
        v_code: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        v_short_code: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        v_image: {
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
        tableName: 'tbl_countries'
    }
);

module.exports = SliderModal;

