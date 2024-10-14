'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    CountriesModel = require("../models/Countries"),
    UserModel = require("../models/User"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');
    const Sequelize = require('sequelize');
    const { Op } = require('sequelize');

let Dashboard = async (body) => {
    let findUser = {}
    let allUser = await UserModel.findAll({
        where: findUser,
        order: [['id', 'DESC']],
        raw: true
    });
    
    let total_active_user = allUser.filter(user => user.e_status == 'Active')?.length

    let total_inactive_user = allUser.filter(user => user.e_status == 'Inactive')?.length

    // Total top 10 countries list in which users exist with count
    let topCountries = await UserModel.findAll({
        attributes: ['i_country_id', [Sequelize.fn('count', Sequelize.col('i_country_id')), 'count']],
        group: ['i_country_id'],
        order: [[Sequelize.literal('count DESC')]],
        limit: 10,
        raw: true
    });

    let countries = await CountriesModel.findAll({
        where: {id : topCountries.map(x => x.i_country_id)},
        raw: true
    })

    for(let i=0; i<countries.length; i++) {
        countries[i].v_image_path = countries[i].v_image ? process.env.BASE_URL+'/'+config.upload_folder + config.upload_entities.countries_image_folder + countries[i].v_image : process.env.BASE_URL+'/'+config.upload_folder + config.upload_entities.countries_image_folder + 'NO_IMAGE_FOUND.jpg';
    }

    for(let i=0; i<topCountries?.length; i++) {
        topCountries[i].country = countries.filter(x => x.id == topCountries[i].i_country_id)[0]
    }
    
    let _result = { total_user_count: 0, total_active_user: 0, total_inactive_user: 0, user_countries_detail: [] };
    _result.total_user_count = allUser?.length;
    _result.total_active_user = total_active_user;
    _result.total_inactive_user = total_inactive_user;
    _result.user_countries_detail = topCountries;
    return _result;
    
}

module.exports = {
    Dashboard: Dashboard
}