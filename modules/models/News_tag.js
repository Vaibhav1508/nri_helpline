'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const NewsTagModel = sequelize_mysql.define("tbl_news_tags",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        i_category_news_id:{
            type: Sequelize.INTEGER
        },
        i_tag_id:{
            type: Sequelize.INTEGER
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
        tableName: 'tbl_news_tags'
    }
);

module.exports = NewsTagModel;

