'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    StateModel = require("../../models/State");

let StateList = async (body,req) => {
    let findData = {}
    if (body.i_country_id) {
        findData['i_country_id'] = body.i_country_id
    }
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$and"] = [
                    {v_name: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    let allSlider = await StateModel.findAll({
        where: findData,
        order: [['v_name', 'ASC']],
        raw: true
    });
    let allSliderCount = await StateModel.count({   
        where: findData,     
        order: [['v_name', 'ASC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.states = allSlider;
    _result.total_count = allSliderCount;
    return _result;
    
}

module.exports = {
    StateList: StateList
}