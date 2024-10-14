'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const UpcomingService = require("./Upcoming_services");

const UpcomingServiceFeedbacksModal = sequelize_mysql.define("tbl_upcoming_service_feedbacks",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        i_upcoming_service_id : {
            type: Sequelize.INTEGER
        },
        i_user_id : {
            type: Sequelize.INTEGER
        },
        t_service_feedback_text:{
            type: Sequelize.STRING
        },
        t_admin_reply_text:{
            type: Sequelize.STRING
        },
        e_is_admin_reply:{
            type: Sequelize.STRING
        },
        v_email_id: {
            type: Sequelize.STRING
        },
        d_admin_reply_date: {
            type: Sequelize.DATE,
            defaultValue: ()=>new Date()
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
        tableName: 'tbl_upcoming_service_feedbacks'
    }
);
UpcomingServiceFeedbacksModal.belongsTo(UpcomingService, {
    foreignKey: 'i_upcoming_service_id', // The foreign key in the CategoryNews model that references Category's primary key
    as: 'upcomin_service', // Alias for the association
});

module.exports = UpcomingServiceFeedbacksModal;

