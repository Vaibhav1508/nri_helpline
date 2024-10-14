'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const Category = require("./Category");

const NewsModel = sequelize_mysql.define("tbl_category_news",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        i_category_id : {
            type: Sequelize.INTEGER,
        },
        v_title:{
            type: Sequelize.STRING
        },
        t_description:{
            type: Sequelize.STRING
        },
        d_news_date:{
            type: Sequelize.DATE,
            defaultValue: null
        },
        v_news_source:{
            type: Sequelize.STRING
        },
        v_link:{
            type: Sequelize.STRING
        },
        v_image_name: {
            type: Sequelize.STRING,
            defaultValue : null
        },
        i_order : {
            type: Sequelize.INTEGER,
        },
        e_is_featured_news: {
            type: Sequelize.ENUM,
            values: ['Yes', 'No'],
            defaultValue : 'No'
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
        tableName: 'tbl_category_news'
    }
);

NewsModel.belongsTo(Category, {
    foreignKey: 'i_category_id', // The foreign key in the CategoryNews model that references Category's primary key
    as: 'category', // Alias for the association
});
module.exports = NewsModel;

