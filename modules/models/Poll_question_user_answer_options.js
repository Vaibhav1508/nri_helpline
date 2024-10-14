'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const PollQuestionUserAnswerOptionsModal = sequelize_mysql.define("tbl_poll_question_user_answer_options",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        i_poll_question_user_answer_id : {
            type: Sequelize.INTEGER
        },
        i_user_id:{
            type: Sequelize.INTEGER
        },
        i_poll_question_id:{
            type: Sequelize.INTEGER
        },
        j_poll_question_option_id: {
            type: Sequelize.JSON
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
        tableName: 'tbl_poll_question_user_answer_options'
    }
);

module.exports = PollQuestionUserAnswerOptionsModal;

