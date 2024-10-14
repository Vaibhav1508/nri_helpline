'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    CityModel = require("../../models/City"),
    BadRequestError = require('../../errors/badRequestError');

let CityList = async (body,req) => {
    let findData = {}
    if (body.i_state_id) {
        findData['i_state_id'] = body.i_state_id 
    }
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$and"] = [
                    {v_name: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    let allSlider = await CityModel.findAll({
        where: findData,
        order: [['v_name', 'ASC']],
        raw: true
    });
    let allSliderCount = await CityModel.count({   
        where: findData,     
        order: [['v_name', 'ASC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.cities = allSlider;
    _result.total_count = allSliderCount;
    return _result;
    
}

module.exports = {
    CityList: CityList
}