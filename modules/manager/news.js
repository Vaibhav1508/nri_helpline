'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    NewsModel = require("../models/News"),
    CategoryModel = require("../models/Category"),
    TagsModel = require("../models/Tags"),
    NewsTagsModel = require("../models/News_tag"),
    PushNotificationManager = require("../manager/push_notification"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');
    const Sequelize = require('sequelize');
    const { Op } = require('sequelize');

let CreateNews = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    ['i_category_id', 'v_title', 't_description', 'v_news_source', 'v_link'].forEach(x => {
        if (!body[x].trim('')) {
            throw new BadRequestError(body[x] + " is required");
        }
    });

    if (!body.e_type) {
        throw new BadRequestError("news type is required");
    }
    
    let news = await NewsModel
        .findOne({ where: {v_title: body.v_title, e_type : body.e_type}, raw: true });
    
    // if(news) {
    //     throw new BadRequestError("News with this title and type is already exists");
    // }

    let filename = "";
    try {
        filename = req.file.filename;
    }
    catch (error) {
    }

    if (!filename) {
        throw new BadRequestError('Upload any image');
    }

    let category = await CategoryModel.findOne({ where: {id: body.i_category_id}, raw: true });
    
    if(!category) {
        throw new BadRequestError("Category does not exists");
    } if(category.e_status == 'Inactive') {
        throw new BadRequestError("Selected category is not active");
    }

    let cat_news = await NewsModel.findAll({ where: {}, raw: true });

    let max_order = 0
    if(cat_news?.length > 0) {
        max_order = cat_news.reduce((max, obj) => Math.max(max, obj.i_order), -Infinity);
    }

    let newsData = {
        v_image_name : filename,
        i_category_id : body.i_category_id,
        v_title: body.v_title,
        t_description: body.t_description,
        d_news_date: body.d_news_date,
        v_news_source: body.v_news_source,
        v_link : body.v_link,
        e_type : body.e_type,
        e_is_featured_news : body.e_is_featured_news == 'Yes' ? 'Yes' : 'No',
        i_order : max_order == 0 ? 1 : max_order+1 
    }
    let existingTag = []
    let newTagsId = []
    if(body?.tags?.length > 0) {
        // body.tags = JSON.parse(body?.tags)
        

        try {
            existingTag = await TagsModel.findAll({ where: { v_name: body?.tags }, raw: true });
            
          } catch (error) {
            console.error("Error executing the query:", error);
          }
        
        const inactiveTags = existingTag.filter(et => et.e_status == 'Inactive');
        if (inactiveTags.length > 0) {
            const inactiveTagNames = inactiveTags.map(tag => tag.v_name);
            throw new BadRequestError(`Inactive tags found: ${inactiveTagNames.join(', ')}`);
        }
        const newTags = body?.tags?.filter(tag => {
            return !existingTag.some(et => et.v_name == tag);
        });
        try {
            const insertedTags = await TagsModel.bulkCreate(newTags.map(tag => ({ v_name: tag })), { raw: true });
            const formattedTags = insertedTags.map(tag => JSON.parse(JSON.stringify(tag)));
            newTagsId = formattedTags;
        } catch (error) {
            console.log("err" , error)
        }
        
    }

    let newsDetail = await NewsModel.create(newsData);
    newsDetail.v_image_path = newsDetail.v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + newsDetail.v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + 'NO_IMAGE_FOUND.jpg';

    const combinedIds = [...existingTag, ...newTagsId].map(item => item.id);
    try {
        const insertedTags = await NewsTagsModel.bulkCreate(combinedIds.map(cid => ({ i_category_news_id : newsDetail.id,i_tag_id : cid })), { raw: true });
        const formattedTags = insertedTags.map(tag => JSON.parse(JSON.stringify(tag)));
        newTagsId = formattedTags;
    } catch (error) {
        console.log("err" , error)
    }

    if(body.send_notification) {
        let notificationData = {
            e_type: 'News',
            v_title: body.v_title,
            v_image : filename,
            i_news_id : newsDetail.id
        }
        await PushNotificationManager.addNotificationRecordInDB(notificationData)
    }
    return {news : newsDetail};
}

let NewsList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$and"] = [
                    {v_title: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    if(body.i_category_id) {
        findData['i_category_id'] = body.i_category_id
    }
    if(body.is_featured) {
        findData['e_is_featured_news'] = body.is_featured
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
    
            // Format the dates as 'YYYY-MM-DD' for your database
            const startDateFormatted = new Date(startDate).toISOString().split('T')[0] + ' 00:00:00';
            const endDateFormatted = new Date(endDate).toISOString().split('T')[0] + ' 23:59:59';
    
            findData['d_news_date'] = {
                [Op.between]: [startDateFormatted, endDateFormatted]
            };
        }
    }
    let tag_included_ids = []
    if(body.i_tag_id) {
        tag_included_ids = await NewsTagsModel.findAll({
            where: {i_tag_id : body.i_tag_id},
            order: [['id', 'DESC']],
            raw: true,
        });
    }
    tag_included_ids = tag_included_ids.map(x => x.i_category_news_id)
    if(tag_included_ids?.length > 0) {
        findData['id'] = tag_included_ids
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
    
        tagIds = tagIds.map(x => x.i_tag_id)
    
        let tagsObj = await TagsModel.findAll({
            where: {id : tagIds},
            raw: true
        });
    
        allNews[i].tags = tagsObj
    }
    let allNewsCount = await NewsModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });

    if(body.i_tag_id && !tag_included_ids?.length) {
        allNews = []
        allNewsCount = 0
    }

    let _result = { total_count: 0 };
    _result.news = allNews;
    _result.total_count = allNewsCount;
    return _result;
}

let UpdateNews = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    if (!body.v_title) {
        throw new BadRequestError("news name is required");
    }
    if (!body.e_type) {
        throw new BadRequestError("news type is required");
    }

    let news = await NewsModel
        .findOne({ where: {id: req.params.id}, raw: true });

    let sameNameNews = await NewsModel
        .findOne({ where: {id : {[Sequelize.Op.ne]: req.params.id}, v_title: body.v_title, e_type: body.e_type}, raw: true });
    
    // if(sameNameNews) {
    //     throw new BadRequestError("News with this title and type already exists"); 
    // }
    
    if(!news) {
        throw new BadRequestError("news doesn't exists");
    }

    let updateData = {};
    let optionalFiled = ['i_category_id', 'v_title', 't_description', 'd_news_date', 'e_status','v_news_source', 'v_link', 'e_is_featured_news'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });

    if (req.file && req.file.filename) {
        updateData["v_image_name"] = req.file.filename;
    }

    updateData["updated_at"] = Date.now();
    updateData["e_type"] = body.e_type;

    let existingTag = []
    let newTagsId = []
    if(body?.tags?.length > 0) {
        // body.tags = JSON.parse(body?.tags)
        

        try {
            existingTag = await TagsModel.findAll({ where: { v_name: body?.tags }, raw: true });
          } catch (error) {
            console.error("Error executing the query:", error);
          }
        
        const newTags = body?.tags?.filter(tag => {
            return !existingTag.some(et => et.v_name == tag);
        });
        try {
            const insertedTags = await TagsModel.bulkCreate(newTags.map(tag => ({ v_name: tag })), { raw: true });
            const formattedTags = insertedTags.map(tag => JSON.parse(JSON.stringify(tag)));
            newTagsId = formattedTags;
        } catch (error) {
            console.log(error)
            if(error?.parent?.code == 'ER_DUP_ENTRY') {
                throw new BadRequestError("Duplicate tags found")
            }
        }
        
    }

    const inactiveTags = existingTag.filter(et => et.e_status == 'Inactive');
        if (inactiveTags.length > 0) {
            const inactiveTagNames = inactiveTags.map(tag => tag.v_name);
            throw new BadRequestError(`Inactive tags found: ${inactiveTagNames.join(', ')}`);
        }
    let newsData = {} 
    try {
        await NewsModel.update(updateData, { where: { id: req.params.id }, raw: true });
        newsData = await NewsModel.findOne({where:{id: req.params.id},raw:true});
    } catch(err) {
        if(err.parent.code == 'ER_DUP_ENTRY') {
            throw new BadRequestError("Record with this title is already exist")
        }
    }

    const combinedIds = [...existingTag, ...newTagsId].map(item => item.id);
    try {
        await NewsTagsModel.destroy({
            where: {i_category_news_id : newsData.id},
            raw: true
        });
        const insertedTags = await NewsTagsModel.bulkCreate(combinedIds.map(cid => ({ i_category_news_id : newsData.id,i_tag_id : cid, updated_at: Date.now() })), { raw: true });
        const formattedTags = insertedTags.map(tag => JSON.parse(JSON.stringify(tag)));
        newTagsId = formattedTags;
    } catch (error) {
        console.log("err" , error)
    }

    return {news : newsData}
}

let NewsDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("NewsID is required");
    }
    const newsData = await NewsModel.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: CategoryModel,
            as: 'category', // Use the correct alias if you've defined one
          },
        ],
        raw: true,
      });

    let tagIds = await NewsTagsModel.findAll({
        where: {i_category_news_id : newsData.id},
        raw: true
    });

    tagIds = tagIds.map(x => x.i_tag_id)

    let tagsObj = await TagsModel.findAll({
        where: {id : tagIds},
        raw: true
    });

    newsData.tags = tagsObj

    newsData.v_image_path = newsData.v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + newsData.v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + 'NO_IMAGE_FOUND.jpg';
    return {news : newsData};
}

let DeleteNews = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if(!body.selected_ids?.length) {
        throw new BadRequestError("NewsID is required");
    }
    let newsData = await NewsModel.findAll({
        where: {id : body.selected_ids},
        raw: true
    });
    await NewsTagsModel.destroy({
        where: {i_category_news_id : body.selected_ids},
        raw: true
    });
    newsData.forEach(x => {
        fs.unlink('uploads/news_image/'+x.v_image_name, function (err) {
            if (err) throw err;
            console.log("File deleted!");
        });
    })
    await NewsModel.destroy({
        where: {id : body.selected_ids},
        raw: true
    });
    
    return {message : 'News deleted successfully'};
}

module.exports = {
    CreateNews:CreateNews,
    NewsList: NewsList,
    UpdateNews: UpdateNews,
    NewsDetail: NewsDetail,
    DeleteNews: DeleteNews
}