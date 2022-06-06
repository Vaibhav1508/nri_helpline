'use strict';
let sequelize_mysql = require("../helpers/sequelize-mysql");
let Sequelize = require("sequelize");
let UsersModel = require('../models/Users');
const UserImagesModel = sequelize_mysql.define("user_images",
    {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: Sequelize.INTEGER,
            references: 'users',
            referencesKey: 'id'
        },
        image: {
            type: Sequelize.STRING
        },        
        createdAt: {
            type: Sequelize.DATE,
            field: 'createdAt',
            defaultValue: ()=>new Date()
        },
        updatedAt: {
            type: Sequelize.DATE,
            field: 'updatedAt',
            defaultValue: ()=>new Date()
        },
    },
    {
        freezeTableName: true,
        tableName: 'user_images'
    }
);
UsersModel.hasMany(UserImagesModel);
UserImagesModel.belongsTo(UsersModel,{foreignKey: 'userId', as: 'user_images'});
module.exports = UserImagesModel;

