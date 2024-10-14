'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    CategoryModel = require("../models/Category"),
    NewsModel = require("../models/News"),
    NewsTagModel = require("../models/News_tag"),
    TagsModal = require("../models/Tags"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');
    const Sequelize = require('sequelize');

let CreateCategory = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    ['v_name'].forEach(x => {
        if (!body[x].trim('')) {
            throw new BadRequestError("Category Name is required");
        }
    });

    if (!body.e_type) {
        throw new BadRequestError("News category type is required");
    }

    let user = await CategoryModel
        .findOne({ where: {v_name: body.v_name, e_type: body.e_type}, raw: true });
    
    if(user) {
        throw new BadRequestError("Record with this name and type is already exists");
    }

    // let filename = "";
    // try {
    //     filename = req.file.filename;
    // }
    // catch (error) {
    // }

    // if (!filename) {
    //     throw new BadRequestError('Upload Any Image');
    // }
    let CategoryData = {
        // v_image_name : filename,
        v_name: body.v_name,
        e_type: body.e_type
    }

    try {
        let CategoryDetail = await CategoryModel.create(CategoryData);
        CategoryDetail.v_image_path = CategoryDetail.v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + CategoryDetail.v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + 'NO_IMAGE_FOUND.jpg';
    
        return {category : CategoryDetail};
    } catch(err) {
        console.log(err)
    }
}

let CategoryList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$and"] = [
                    {v_name: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    let allCategory = await CategoryModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true
    });
    for(let i=0 ; i<allCategory.length; i++) {
        allCategory[i].v_image_path = allCategory[i].v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + allCategory[i].v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + 'NO_IMAGE_FOUND.jpg';
    }
    let allCategoryCount = await CategoryModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.category = allCategory;
    _result.total_count = allCategoryCount;
    return _result;
}

let UpdateCategory = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
        if (!body.v_name) {
            throw new BadRequestError("Category name is required");
        }

        if (!body.e_type) {
            throw new BadRequestError("News category type is required");
        }

    let category = await CategoryModel
        .findOne({ where: {id: req.params.id}, raw: true });
    
    if(!category) {
        throw new BadRequestError("Category doesn't exists");
    }

    let sameNameCategory = await CategoryModel
        .findOne({ where: {id : {[Sequelize.Op.ne]: req.params.id}, v_name: body.v_name, e_type: body.e_type}, raw: true });

    if(sameNameCategory) {
        throw new BadRequestError("Category with this name and type already exists");
    }

    let updateData = {};
    let optionalFiled = ['v_name', 'e_type', 'e_status'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });

    updateData["updated_at"] = Date.now();
    try {
        await CategoryModel.update(updateData, { where: { id: req.params.id }, raw: true });
        let CategoryData = await CategoryModel.findOne({where:{id: req.params.id},raw:true});
            
        return {category : CategoryData}
    } catch(err) {
        if(err.parent.code == 'ER_DUP_ENTRY') {
            throw new BadRequestError("Record with this name is already exist")
        }
    }
    
}

let CategoryDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("CategoryID is required");
    }
    let CategoryData = await CategoryModel.findOne({
        where: {id : req.params.id},
        raw: true
    });
    if(!CategoryData) {
        throw new BadRequestError("Category not available")
    }
    CategoryData.v_image_path = CategoryData.v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + CategoryData.v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
    return {category : CategoryData};
}

let DeleteCategory = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if(!body.selected_ids?.length) {
        throw new BadRequestError("CategoryID is required");
    }
    let CategoryData = await CategoryModel.findAll({
        where: {id : body.selected_ids},
        raw: true
    });
    
    await CategoryModel.destroy({
        where: {id : body.selected_ids},
        raw: true
    });

    // Find news data which are associated with categoirs
    let newsData = await NewsModel.findAll({
        where: {i_category_id : body.selected_ids},
        raw: true
    });

    // Extract news ids
    newsData = newsData.map(x => x.id)

    // Find news and tags association
    let newsTagData = await NewsTagModel.findAll({
        where: {i_category_news_id : newsData},
        raw: true
    });

    // Get tags id from news tags table
    let tagId = newsTagData.map(x => x.i_tag_id)

    // Check if same tags are associated with other news or not.
    let checkDuplicate = await NewsTagModel.findAll({
        where: {i_category_news_id : {[Sequelize.Op.notIn]: newsData} , i_tag_id : tagId},
        raw: true
    });

    checkDuplicate = checkDuplicate.map(x => x.i_tag_id)

    // If tags are used with other news, Then remove that tag from delete list
    let result = tagId.filter(item => !checkDuplicate.includes(item));

    // Delete news
    await NewsModel.destroy({
        where: {i_category_id : body.selected_ids},
        raw: true
    });

    // Delete association
    await NewsTagModel.destroy({
        where: {i_category_news_id : newsData},
        raw: true
    });

    // Delete tags
    await TagsModal.destroy({
        where: {id : result},
        raw: true
    });
    
    return { message : 'Category deleted successfully' };
}

module.exports = {
    CreateCategory:CreateCategory,
    CategoryList: CategoryList,
    UpdateCategory: UpdateCategory,
    CategoryDetail: CategoryDetail,
    DeleteCategory: DeleteCategory
}