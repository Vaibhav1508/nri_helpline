'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    UserModel = require("../models/User"),
    CountriesModel = require("../models/Countries"),
    StateModel = require("../models/State"),
    CityModel = require("../models/City"),
    ProfessionModel = require("../models/Profession"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');
    const { Op } = require('sequelize');

let UserList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$or"] = [
                    {v_full_name: {$like: '%' + body.filters.searchtext + '%'}},
                    {v_email: {$like: '%' + body.filters.searchtext + '%'}},
                    {v_mobile_number: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    if (body.filters.dateRange) {
        const dateRange = body.filters.dateRange.split('-');
    
        if (dateRange.length === 2) {
            // Split the date parts
            const startDateParts = dateRange[0].split('/');
            const endDateParts = dateRange[1].split('/');
    
            // Create Date objects with the correct month, day, and year order
            const startDate = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
            const endDate = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);
    
            // Format the dates as 'YYYY-MM-DD HH:MM:SS' for your database
            const startDateFormatted = new Date(startDate).toISOString().split('T')[0] + ' 00:00:00';
            const endDateFormatted = new Date(endDate).toISOString().split('T')[0] + ' 23:59:59';
    
            findData['created_at'] = {
                [Op.between]: [startDateFormatted, endDateFormatted]
            };
        }
    }
    let allUser = await UserModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true
    });
    let country = await CountriesModel.findAll({},{raw:true});
    for(let i=0 ; i<allUser.length; i++) {
        allUser[i].v_image_path = allUser[i].v_profile_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + allUser[i].v_profile_image : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
        allUser[i].country = country.filter(x => x.id == allUser[i].i_country_id)[0]
    }
    let allUserCount = await UserModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.user = allUser;
    _result.total_count = allUserCount;
    return _result;
    
}

let UpdateUser = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
        if (!body.e_status) {
            throw new BadRequestError("Status is required");
        }

    let user = await UserModel
        .findOne({ where: {id: req.params.id}, raw: true });
    
    if(!user) {
        throw new BadRequestError("user doesn't exists");
    }

    let updateData = {};
    let optionalFiled = ['e_status'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });
    updateData["updated_at"] = Date.now();
    await UserModel.update(updateData, { where: { id: req.params.id }, raw: true });
    let userData = await UserModel.findOne({where:{id: req.params.id},raw:true});
            
    return {user : userData}
    
}

let UserDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("UserID is required");
    }
    let userDetail = await UserModel.findOne({
        where: {id : req.params.id, e_status : 'Active'},
        raw: true
    });
    if(!userDetail) {
        throw new BadRequestError("User not available")
    }
    if (userDetail) {
        userDetail.country = {};  // Initialize country object
        userDetail.state = {};    // Initialize state object
        userDetail.city = {};     // Initialize city object
        userDetail.profession = {};     // Initialize profession object
        // Fetch the country name
        let country = {}
        let other_country = {}
        let state = {}
        let city = {}
        let profession = {}
        if(userDetail.i_country_id) {
          country = await CountriesModel.findOne({ where: { id: userDetail.i_country_id }, raw: true });
        }

        if(userDetail?.i_other_country_id) {
            other_country = await CountriesModel.findOne({ where: { id: userDetail?.i_other_country_id }, raw: true });
        }
        
        // Fetch the state name
        if(userDetail.i_state_id) {
          state = await StateModel.findOne({ where: { id: userDetail.i_state_id }, raw: true });
        }
      
        // Fetch the city name
        if(userDetail.i_city_id) {
          city = await CityModel.findOne({ where: { id: userDetail.i_city_id }, raw: true });
        }
    
        if(userDetail.i_profession_id) {
          profession = await ProfessionModel.findOne({ where: { id: userDetail.i_profession_id }, raw: true });
        }
      
        // Add country, state, and city names to the userDetail object
        userDetail.country = JSON.stringify(country) == '{}' ? null : country;
        userDetail.other_country = JSON.stringify(other_country) == '{}' ? null : other_country;
        userDetail.state = JSON.stringify(state) == '{}' ? null : state;
        userDetail.city = JSON.stringify(city) == '{}' ? null : city;
        userDetail.profession = JSON.stringify(profession) == '{}' ? null : profession;
    
        delete userDetail.i_country_id
        delete userDetail.i_state_id
        delete userDetail.i_city_id
        delete userDetail.i_profession_id
      }
    userDetail.v_image_path = userDetail.v_profile_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + userDetail.v_profile_image : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
    return {user : userDetail};
}

module.exports = {
    UserList: UserList,
    UserDetail: UserDetail,
    UpdateUser: UpdateUser
}