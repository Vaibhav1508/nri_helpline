'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const UservocationModel = sequelize_mysql.define("usersubvocation",
    {
        usersubvocationID :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userID:{
            type: Sequelize.INTEGER
        },
        vocationID: {
            type: Sequelize.INTEGER
        },
        subvocationID: {
            type: Sequelize.INTEGER
        },
        usersubvocationStatus: {
            type: Sequelize.ENUM,
            values: ['Following', 'Unfollowed'],
            defaultValue : 'Following'
        }
    },
    {
        freezeTableName: true,
        tableName: 'usersubvocation'
    }
);

module.exports = UservocationModel;