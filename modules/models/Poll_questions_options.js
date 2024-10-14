'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const PollQuestionsOptionsModal = sequelize_mysql.define("tbl_poll_question_options",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        poll_question_id : {
            type: Sequelize.INTEGER
        },
        v_option_name:{
            type: Sequelize.STRING
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
        tableName: 'tbl_poll_question_options'
    }
);

module.exports = PollQuestionsOptionsModal;

