'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
const PollQuestionsOptionsModal = require("./Poll_questions_options");

const PollQuestionsModal = sequelize_mysql.define("tbl_poll_questions",
    {
        id :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        t_title:{
            type: Sequelize.STRING
        },
        e_type: {
            type: Sequelize.ENUM,
            values: ['Radio', 'Checkbox'],
            defaultValue : null
        },
        i_order : {
            type: Sequelize.INTEGER,
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
        tableName: 'tbl_poll_questions'
    }
);
PollQuestionsModal.hasMany(PollQuestionsOptionsModal, { as: 'options', foreignKey: 'poll_question_id' });
module.exports = PollQuestionsModal;