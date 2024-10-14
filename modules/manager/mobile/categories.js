'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    CategoryModel = require("../../models/Category"),
    NewsModel = require("../../models/News"),
    BadRequestError = require('../../errors/badRequestError');
    const Sequelize = require('sequelize');

let Categories = async (body,req) => {
    console.log(body)
    let findData = {e_status : 'Active'}
    let newsData = await NewsModel.findAll({
        where: {e_status : 'Active'},
        order: [['d_news_date', 'DESC'], ['created_at', 'DESC']],
        raw: true,
    });

    if(body.e_type) {
        findData['e_type'] = body.e_type;    
    }
    let availableWithNews = newsData.map(x => x.i_category_id);
    findData['id'] = {[Sequelize.Op.in]: availableWithNews}
    let allCategory = await CategoryModel.findAll({
        where: findData,
        order: [['id', 'ASC']],
        raw: true
    });
    for(let i=0 ; i<allCategory.length; i++) {
        allCategory[i].v_image_path = allCategory[i].v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + allCategory[i].v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
    }

    let _result = { categories_list : {} };
    _result.categories_list = allCategory;
    return _result;
}

module.exports = {
    Categories: Categories
}