'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const TagsModal = sequelize_mysql.define("tbl_tags",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        v_name:{
            type: Sequelize.STRING
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
        tableName: 'tbl_tags'
    }
);

module.exports = TagsModal;

