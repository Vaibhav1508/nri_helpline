'use strict';
const { ENUM } = require("sequelize");
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const UserPushNotificationsModel = sequelize_mysql.define("tbl_user_push_notifications",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        i_push_notification_id:{
            type: Sequelize.INTEGER
        },
        i_user_id:{
            type: Sequelize.INTEGER
        },
        i_news_id:{
            type: Sequelize.INTEGER
        },
        e_status: {
            type: Sequelize.ENUM,
            values: ['Read', 'Unread'],
            defaultValue : 'Unread'
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
        tableName: 'tbl_user_push_notifications'
    }
);

module.exports = UserPushNotificationsModel;

