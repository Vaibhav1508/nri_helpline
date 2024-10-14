'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    CountriesModel = require("../../models/Countries"),
    BadRequestError = require('../../errors/badRequestError');

let CountryList = async (body,req) => {
    let findData = {}
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$and"] = [
                    {v_name: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    let allSlider = await CountriesModel.findAll({
        where: findData,
        order: [['v_name', 'ASC']],
        raw: true
    });
    for(let i=0 ; i<allSlider.length; i++) {
        allSlider[i].v_image_path = allSlider[i].v_image ? process.env.BASE_URL+'/'+config.upload_folder + config.upload_entities.countries_image_folder + allSlider[i].v_image : process.env.BASE_URL+'/'+config.upload_folder + config.upload_entities.countries_image_folder + 'NO_IMAGE_FOUND.jpg';
    }
    let allSliderCount = await CountriesModel.count({   
        where: findData,
        order: [['v_name', 'ASC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.countries = allSlider;
    _result.total_count = allSliderCount;
    return _result;
}

module.exports = {
    CountryList: CountryList
}