'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    NewsModel = require("../../models/News"),
    NewsTagsModel = require("../../models/News_tag"),
    TagsModel = require("../../models/Tags"),
    CategoryModel = require("../../models/Category"),
    BadRequestError = require('../../errors/badRequestError');

    let NewsList = async (body,req) => {
        let {order_by} = req.query
        order_by = order_by ? order_by.toUpperCase() : 'ASC'
        let limit = (body.limit && parseInt(body.limit) > 0) ? parseInt(body.limit) : 10;
        let page = body.page && parseInt(body.page) > 0 ? body.page : 1;
        let offset = (page - 1) * limit;
        let findData = {e_status : 'Active'}
        if (body.filters) {
            if (body.filters.searchtext) {
                    findData["$and"] = [
                        {v_title: {$like: '%' + body.filters.searchtext + '%'}}
                    ]
            }
        }
        if(body.filters.i_category_id) {
            findData['i_category_id'] = body.filters.i_category_id
        }
        if(body.filters.e_type) {
            findData['e_type'] = body.filters.e_type
        }
        let allNews = await NewsModel.findAll({
            where: findData,
            limit,
            offset,
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
        let allNewsCount = await NewsModel.count({   
            where: findData,     
            order: [['d_news_date', 'DESC']],
            raw: true
        });

        allNews = allNews.filter(news => news?.category?.e_status == 'Active')
    
        let _result = { total_count: 0 };
        _result.news = allNews;
        _result.total_count = allNewsCount;
        return _result;
    }

module.exports = {
    NewsList: NewsList
}