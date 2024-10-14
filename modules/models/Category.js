'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const CategoryModal = sequelize_mysql.define("tbl_categories",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        v_name:{
            type: Sequelize.STRING
        },
        v_image_name: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        i_order : {
            type: Sequelize.INTEGER,
        },
        e_type: {
            type: Sequelize.ENUM,
            values: ['Infopedia', 'India Gram'],
            defaultValue : null
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
        tableName: 'tbl_categories'
    }
);

module.exports = CategoryModal;

