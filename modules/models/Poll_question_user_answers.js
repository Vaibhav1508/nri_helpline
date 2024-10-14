'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const PollQuestionUserAnswersModal = sequelize_mysql.define("tbl_poll_question_user_answers",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        i_user_id : {
            type: Sequelize.INTEGER
        },
        i_total_question:{
            type: Sequelize.INTEGER
        },
        i_total_answer:{
            type: Sequelize.INTEGER
        },
        i_total_not_answer:{
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
        tableName: 'tbl_poll_question_user_answers'
    }
);

module.exports = PollQuestionUserAnswersModal;

