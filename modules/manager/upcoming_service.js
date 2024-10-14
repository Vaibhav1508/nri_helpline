'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    UpcomingServiceModel = require("../models/Upcoming_services"),
    UpcomingServiceFeedbacksModal = require("../models/Upcoming_service_feedbacks"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');

let CreateUpcomingService = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    ['v_name', 'v_color_code', 't_description', 'v_feedback_title1', 'v_feedback_title2'].forEach(x => {
        if (!body[x].trim('')) {
            throw new BadRequestError(body[x] +" is required");
        }
    });
    if (!body.v_name) {
        throw new BadRequestError("Name is required");
    }
    if (!body.v_color_code) {
        throw new BadRequestError("Color code is required");
    }
    if (!body.t_description) {
        throw new BadRequestError("Description is required");
    }
    if (!body.v_feedback_title1) {
        throw new BadRequestError("Feedback title1 is required");
    }
    if (!body.v_feedback_title2) {
        throw new BadRequestError("Feedback title2 is required");
    }


    let user = await UpcomingServiceModel
        .findOne({ where: {v_name: body.v_name}, raw: true });
    
    if(user) {
        throw new BadRequestError("Record with this name is already exists");
    }

    let filename = "";
    try {
        filename = req.file.filename;
    }
    catch (error) {
    }

    if (!filename) {
        throw new BadRequestError('Upload Any Image');
    }

    let upcoming_service = await UpcomingServiceModel.findAll({ where: {}, raw: true });

    let max_order = 0
    if(upcoming_service?.length > 0) {
        max_order = upcoming_service.reduce((max, obj) => Math.max(max, obj.i_order), -Infinity);
    }

    let UpcomingServiceData = {
        v_icon_image : filename,
        v_name: body.v_name,
        v_color_code : body.v_color_code,
        t_description : body.t_description,
        v_feedback_title1 : body.v_feedback_title1, 
        v_feedback_title2 : body.v_feedback_title2, 
        i_order : max_order+1
    }

    try {
        let UpcomingServiceDetail = await UpcomingServiceModel.create(UpcomingServiceData);
        UpcomingServiceDetail.v_image_path = UpcomingServiceDetail.v_icon_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.upcoming_service_icon_image_folder + UpcomingServiceDetail.v_icon_image : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.upcoming_service_icon_image_folder + 'NO_IMAGE_FOUND.jpg';
    
        return {upcoming_service : UpcomingServiceDetail};
    } catch(err) {
        console.log(err)
    }
}

let UpcomingServiceList = async (body) => {
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
    let allUpcomingService = await UpcomingServiceModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true
    });
    for(let i=0 ; i<allUpcomingService.length; i++) {
        allUpcomingService[i].v_image_path = allUpcomingService[i].v_icon_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.upcoming_service_icon_image_folder + allUpcomingService[i].v_icon_image : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.upcoming_service_icon_image_folder + 'NO_IMAGE_FOUND.jpg';
    }
    let allUpcomingServiceCount = await UpcomingServiceModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.upcoming_service = allUpcomingService;
    _result.total_count = allUpcomingServiceCount;
    return _result;
    
}

let UpdateUpcomingService = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    if (!body.v_name) {
        throw new BadRequestError("Name is required");
    }
    if (!body.v_color_code) {
        throw new BadRequestError("Color code is required");
    }
    if (!body.t_description) {
        throw new BadRequestError("Description is required");
    }
    if (!body.v_feedback_title1) {
        throw new BadRequestError("Feedback title1 is required");
    }
    if (!body.v_feedback_title2) {
        throw new BadRequestError("Feedback title2 is required");
    }

    let UpcomingService = await UpcomingServiceModel
        .findAll({ where: {id: req.params.id}, raw: true });
    
    if(!UpcomingService.filter(x => x.id == req.params.id).length > 0) {
        throw new BadRequestError("Upcoming service doesn't exists");
    }
    
    let updateData = {};
    let optionalFiled = ['v_name', 'v_color_code', 'v_icon_image', 't_description', 'v_feedback_title1', 'v_feedback_title2', 'e_status'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });

    if (req.file && req.file.filename) {
        updateData["v_icon_image"] = req.file.filename;
    }
    updateData["updated_at"] = Date.now();
    try {
        await UpcomingServiceModel.update(updateData, { where: { id: req.params.id }, raw: true });
        let UpcomingServiceData = await UpcomingServiceModel.findOne({where:{id: req.params.id},raw:true});
            
        return {upcoming_service : UpcomingServiceData}
    } catch(err) {
        if(err.parent.code == 'ER_DUP_ENTRY') {
            throw new BadRequestError("Record with this name is already exist")
        }
    }
    
}

let UpcomingServiceDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("Upcoming serviceID is required");
    }
    let UpcomingServiceData = await UpcomingServiceModel.findOne({
        where: {id : req.params.id},
        raw: true
    });
    if(!UpcomingServiceData) {
        throw new BadRequestError("Upcoming service not available")
    }
    UpcomingServiceData.v_image_path = UpcomingServiceData.v_icon_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.upcoming_service_icon_image_folder + UpcomingServiceData.v_icon_image : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
    return {upcoming_service : UpcomingServiceData};
}

let DeleteUpcomingService = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if(!body.selected_ids?.length) {
        throw new BadRequestError("Upcoming serviceID is required");
    }
    let UpcomingServiceData = await UpcomingServiceModel.findAll({
        where: {id : body.selected_ids},
        raw: true
    });
    UpcomingServiceData.forEach(x => {
        fs.unlink('uploads/upcoming_service_icon_image/'+x.v_icon_image, function (err) {
            if (err) throw err;
            console.log("File deleted!");
        });
    })
    await UpcomingServiceModel.destroy({
        where: {id : body.selected_ids},
        raw: true
    });

    await UpcomingServiceFeedbacksModal.destroy({
        where: {i_upcoming_service_id : body.selected_ids},
        raw: true
    });
    
    return { message : 'Upcoming service deleted successfully' };
}

module.exports = {
    CreateUpcomingService:CreateUpcomingService,
    UpcomingServiceList: UpcomingServiceList,
    UpdateUpcomingService: UpdateUpcomingService,
    UpcomingServiceDetail: UpcomingServiceDetail,
    DeleteUpcomingService: DeleteUpcomingService
}