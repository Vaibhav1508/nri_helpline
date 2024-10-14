'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    SliderModel = require("../../models/Slider"),
    BadRequestError = require('../../errors/badRequestError');

let SliderList = async (body,req) => {
    let {order_by} = req.query
    order_by = order_by ? order_by.toUpperCase() : 'ASC'
    let limit = (body.limit && parseInt(body.limit) > 0) ? parseInt(body.limit) : 10;
    let page = body.page && parseInt(body.page) > 0 ? body.page : 1;
    let offset = (page - 1) * limit;
    let findData = {e_status : 'Active' }
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$and"] = [
                    {v_name: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    let allSlider = await SliderModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['v_name', order_by]],
        raw: true
    });
    for(let i=0 ; i<allSlider.length; i++) {
        allSlider[i].sliderImage = allSlider[i].v_image_name ? config.upload_folder + config.upload_entities.slider_image_folder + allSlider[i].v_image_name : config.upload_folder + config.upload_entities.slider_image_folder + 'NO_IMAGE_FOUND.jpg';
    }
    let allSliderCount = await SliderModel.count({   
        where: findData,     
        order: [['v_name', order_by]],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.sliders = allSlider;
    _result.total_count = allSliderCount;
    return _result;
    
}

module.exports = {
    SliderList: SliderList
}