'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const SliderModal = sequelize_mysql.define("tbl_cities",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        i_country_id : {
            type: Sequelize.INTEGER,
        },
        i_state_id: {
            type: Sequelize.INTEGER,
        },
        v_name:{
            type: Sequelize.STRING
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
        tableName: 'tbl_cities'
    }
);

module.exports = SliderModal;

