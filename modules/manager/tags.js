'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    TagsModel = require("../models/Tags"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');

let CreateTag = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    ['v_name'].forEach(x => {
        if (!body[x].trim('')) {
            throw new BadRequestError("Name is required");
        }
    });

    let user = await TagsModel
        .findOne({ where: {v_name: body.v_name}, raw: true });
    
    if(user) {
        throw new BadRequestError("Tag with this name is already exists");
    }

    // let e_status = body.e_status == 1 ? 'Active' : 'Inactive';
    let tagData = {
        v_name: body.v_name
    }

    let tagDetail = await TagsModel.create(tagData);

    return {tag : tagDetail};
}

let TagList = async (body) => {
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
    let allTag = await TagsModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true
    });
    let allTagCount = await TagsModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.tag = allTag;
    _result.total_count = allTagCount;
    return _result;
    
}

let UpdateTag = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
        if (!body.v_name) {
            throw new BadRequestError("tag name is required");
        }

    let tag = await TagsModel
        .findOne({ where: {id: req.params.id}, raw: true });
    
    if(!tag) {
        throw new BadRequestError("tag doesn't exists");
    }

    let updateData = {};
    let optionalFiled = ['v_name', 'e_status'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });

    if (req.file && req.file.filename) {
        updateData["v_image_name"] = req.file.filename;
    }
    updateData["updated_at"] = Date.now();
    try {
        await TagsModel.update(updateData, { where: { id: req.params.id }, raw: true });
        let tagData = await TagsModel.findOne({where:{id: req.params.id},raw:true});
            
        return {tag : tagData}
    } catch(err) {
        if(err.parent.code == 'ER_DUP_ENTRY') {
            throw new BadRequestError("Record with this name is already exist")
        }
    }
}

let TagDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("tagID is required");
    }
    let tagData = await TagsModel.findOne({
        where: {id : req.params.id},
        raw: true
    });
    
    return {tag : tagData};
}

let DeleteTag = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if(!body.selected_ids?.length) {
        throw new BadRequestError("tagID is required");
    }
    
    await TagsModel.destroy({
        where: {id : body.selected_ids},
        raw: true
    });
    
    return {message : 'Tag deleted successfully'};
}

module.exports = {
    CreateTag:CreateTag,
    TagList: TagList,
    UpdateTag: UpdateTag,
    TagDetail: TagDetail,
    DeleteTag: DeleteTag
}