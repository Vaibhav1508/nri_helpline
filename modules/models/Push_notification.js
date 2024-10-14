'use strict';
const { ENUM } = require("sequelize");
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const UpcomingServiceFeedbacks = require("./Upcoming_service_feedbacks");

const PushNotificationsModel = sequelize_mysql.define("tbl_push_notifications",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        i_news_id:{
            type: Sequelize.INTEGER
        },
        i_upcoming_service_feedback_id:{
            type: Sequelize.INTEGER
        },
        e_type: {
            type: Sequelize.ENUM,
            values: ['Admin', 'News'],
            defaultValue : null
        },
        v_title: {
            type : Sequelize.STRING,
        },
        t_message: {
            type : Sequelize.STRING,
        },
        v_image: {
            type : Sequelize.STRING,
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
        tableName: 'tbl_push_notifications'
    }
);


PushNotificationsModel.belongsTo(UpcomingServiceFeedbacks, {
    foreignKey: 'i_upcoming_service_feedback_id', // The foreign key in the CategoryNews model that references Category's primary key
    as: 'upcoming_service_feedback', // Alias for the association
});

module.exports = PushNotificationsModel;

