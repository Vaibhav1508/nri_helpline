'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    NewsModel = require("../../models/News"),
    NewsTagsModel = require("../../models/News_tag"),
    TagsModel = require("../../models/Tags"),
    UpcomingServicesModel = require("../../models/Upcoming_services"),
    UpcomingServiceFeedbacksModal = require("../../models/Upcoming_service_feedbacks"),
    CategoryModel = require("../../models/Category"),
    BadRequestError = require('../../errors/badRequestError');
    const Sequelize = require('sequelize');

let HomeScreen = async (body,req) => {
    let newsFindData = {e_is_featured_news : 'Yes', e_status : 'Active'};
    let upcomingServiceFindData = {e_status : 'Active'};
    let categoryFindData = {e_status : 'Active'};
    
    let allNews = await NewsModel.findAll({
        where: newsFindData,
        order: [['d_news_date', 'DESC'], ['created_at', 'DESC']],
        include: [
          {
            model: CategoryModel, // The associated model
            as: 'category', // The alias of the association (if you defined one)
          },
        ],
        raw: true,
      });
    for(let i=0 ; i<allNews.length; i++) {
        allNews[i].v_image_path = allNews[i].v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + allNews[i].v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
        let tagIds = await NewsTagsModel.findAll({
            where: {i_category_news_id : allNews[i].id},
            raw: true
        });

        allNews[i].category = {}; 
        allNews[i].category['id'] = allNews[i]['category.id']
        allNews[i].category['v_name'] = allNews[i]['category.v_name']
        allNews[i].category['v_image_name'] = allNews[i]['category.v_image_name']
        allNews[i].category['i_order'] = allNews[i]['category.i_order']
        allNews[i].category['e_type'] = allNews[i]['category.e_type']
        allNews[i].category['e_status'] = allNews[i]['category.e_status']
        allNews[i].category['v_image_path'] = allNews[i]['category.v_image_name'] ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + allNews[i]['category.v_image_name'] : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
        allNews[i].category['created_at'] = allNews[i]['category.created_at']
        allNews[i].category['updated_at'] = allNews[i]['category.updated_at']

        delete allNews[i]['category.id'];
        delete allNews[i]['category.v_name'];
        delete allNews[i]['category.e_type'];
        delete allNews[i]['category.v_image_name'];
        delete allNews[i]['category.i_order'];
        delete allNews[i]['category.e_status'];
        delete allNews[i]['category.created_at'];
        delete allNews[i]['category.updated_at'];
    
        tagIds = tagIds.map(x => x.i_tag_id)
    
        let tagsObj = await TagsModel.findAll({
            where: {id : tagIds},
            raw: true
        });
    
        allNews[i].tags = tagsObj
    }

    allNews = allNews.filter(news => news?.category?.e_status == 'Active')

    let allFeedbacks = await UpcomingServiceFeedbacksModal.findAll({
        where: {i_user_id : req.user.userId},
        order: [['id', 'ASC']],
        raw: true,
    });
    let allUpcomingServices  = await UpcomingServicesModel.findAll({
        where: upcomingServiceFindData,
        order: [['i_order', 'ASC']],
        raw: true,
    });
    for(let i=0 ; i<allUpcomingServices.length; i++) {
        allUpcomingServices[i].v_image_path = allUpcomingServices[i].v_icon_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.upcoming_service_icon_image_folder + allUpcomingServices[i].v_icon_image : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
        allUpcomingServices[i].feedback = allFeedbacks.filter(x => x.i_upcoming_service_id == allUpcomingServices[i].id).length > 0 ? allFeedbacks.filter(x => x.i_upcoming_service_id == allUpcomingServices[i].id)[0] :{} 
    }

    let newsData = await NewsModel.findAll({
        where: {},
        order: [['d_news_date', 'DESC'], ['created_at', 'DESC']],
        raw: true,
      });
    let availableWithNews = newsData.map(x => x.i_category_id)
    let allCategory = await CategoryModel.findAll({
        where: {e_status : 'Active', id : {[Sequelize.Op.in]: availableWithNews}},
        order: [['id', 'ASC']],
        raw: true
    });
    for(let i=0 ; i<allCategory.length; i++) {
        allCategory[i].v_image_path = allCategory[i].v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + allCategory[i].v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
    }

    let _result = { featured_news : {}, upcoming_services : {}, categories_list : {} };
    _result.featured_news = allNews;
    _result.upcoming_services = allUpcomingServices;
    _result.categories_list = allCategory;
    _result.india_news_api_key = process.env.INDIA_NEWS_API_KEY;
    return _result;
}

module.exports = {
    HomeScreen: HomeScreen
}