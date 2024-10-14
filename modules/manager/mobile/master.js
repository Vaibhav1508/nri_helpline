'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    CountriesModel = require("../../models/Countries"),
    StateModel = require("../../models/State"),
    ProfessionModel = require("../../models/Profession"),
    BadRequestError = require('../../errors/badRequestError');

let MasterList = async (body,req) => {
    let findData = {e_status : 'Active'}
    let stateFindData = {e_status : 'Active', i_country_id: 103}

    let allCountries = await CountriesModel.findAll({
        where: findData,
        order: [['v_name', 'ASC']],
        raw: true
    });
    for(let i=0 ; i<allCountries.length; i++) {
        allCountries[i].v_image_path = allCountries[i].v_image ? process.env.BASE_URL+'/'+config.upload_folder + config.upload_entities.countries_image_folder + allCountries[i].v_image : process.env.BASE_URL+'/'+config.upload_folder + config.upload_entities.countries_image_folder + 'NO_IMAGE_FOUND.jpg';
    }

    let allStates = await StateModel.findAll({
        where: stateFindData,
        order: [['v_name', 'ASC']],
        raw: true
    });

    let allProfession = await ProfessionModel.findAll({
        where: findData,
        order: [['i_order', 'ASC']],
        raw: true
    });

    let _result = { countries: {}, states : {}, profession: {} };
    _result.countries = allCountries;
    _result.states = allStates;
    _result.profession = allProfession;
    return _result;
}

module.exports = {
    MasterList: MasterList
}