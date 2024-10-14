'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    SliderModel = require("../models/Slider"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');

let CreateSlider = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    ['v_name'].forEach(x => {
        if (!body[x].trim('')) {
            throw new BadRequestError("Name is required");
        }
    });

    let user = await SliderModel
        .findOne({ where: {v_name: body.v_name}, raw: true });
    
    if(user) {
        throw new BadRequestError("Slider with this name is already exists");
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
    // let e_status = body.e_status == 1 ? 'Active' : 'Inactive';
    let sliderData = {
        v_image_name : filename,
        v_name: body.v_name
    }

    let sliderDetail = await SliderModel.create(sliderData);
    sliderDetail.v_image_path = sliderDetail.v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.slider_image_folder + sliderDetail.v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.slider_image_folder + 'NO_IMAGE_FOUND.jpg';

    return {slides : sliderDetail};
}

let SliderList = async (body) => {
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
    let allSlider = await SliderModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true
    });
    for(let i=0 ; i<allSlider.length; i++) {
        allSlider[i].v_image_path = allSlider[i].v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.slider_image_folder + allSlider[i].v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.slider_image_folder + 'NO_IMAGE_FOUND.jpg';
    }
    let allSliderCount = await SliderModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.slides = allSlider;
    _result.total_count = allSliderCount;
    return _result;
    
}

let UpdateSlider = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
        if (!body.v_name) {
            throw new BadRequestError("slider name is required");
        }

    let slider = await SliderModel
        .findOne({ where: {id: req.params.id}, raw: true });
    
    if(!slider) {
        throw new BadRequestError("slider doesn't exists");
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
        await SliderModel.update(updateData, { where: { id: req.params.id }, raw: true });
        let sliderData = await SliderModel.findOne({where:{id: req.params.id},raw:true});
            
        return {slides : sliderData}
    } catch(err) {
        if(err.parent.code == 'ER_DUP_ENTRY') {
            throw new BadRequestError("Record with this name is already exist")
        }
    }
}

let SliderDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("SliderID is required");
    }
    let sliderData = await SliderModel.findOne({
        where: {id : req.params.id},
        raw: true
    });
    sliderData.v_image_path = sliderData.v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.slider_image_folder + sliderData.v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.slider_image_folder + 'NO_IMAGE_FOUND.jpg';
    return {slides : sliderData};
}

let DeleteSlider = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if(!body.selected_ids?.length) {
        throw new BadRequestError("SliderID is required");
    }
    let sliderData = await SliderModel.findAll({
        where: {id : body.selected_ids},
        raw: true
    });
    sliderData.forEach(x => {
        fs.unlink('uploads/slider_image/'+x.v_image_name, function (err) {
            if (err) throw err;
            console.log("File deleted!");
        });
    })
    
    await SliderModel.destroy({
        where: {id : body.selected_ids},
        raw: true
    });
    
    return {message : 'Slide deleted successfully'};
}

module.exports = {
    CreateSlider:CreateSlider,
    SliderList: SliderList,
    UpdateSlider: UpdateSlider,
    SliderDetail: SliderDetail,
    DeleteSlider: DeleteSlider
}