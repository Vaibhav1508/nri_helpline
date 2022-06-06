'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");

const UservocationModel = sequelize_mysql.define("uservocation",
    {
        uservocationID :{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userID:{
            type: Sequelize.INTEGER
        },
        vocationID: {
            type: Sequelize.INTEGER,
        },
        uservocationStatus: {
            type: Sequelize.ENUM,
            values: ['Following', 'Unfollowed'],
            defaultValue : 'Following'
        }
    },
    {
        freezeTableName: true,
        tableName: 'uservocation'
    }
);

module.exports = UservocationModel;