'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    IndustryModel = require("../models/Industry"),
    // UserVocationModel = require("../models/User_vocations"),
    BadRequestError = require('../errors/badRequestError');
const { v4: uuidv4 } = require('uuid');
const { use } = require("../routes/Users");
    


// let generateAuthToken = async (phone) => {
//     return uuidv4();
// }

let CreateIndustry = async (body) => {
    // let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    console.log(body)
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("body_empty");
    }
    ['industryName'].forEach(x => {
        if (!body[x]) {
            throw new BadRequestError(x + " is required");
        }
    });

    let user = await IndustryModel
        .findOne({ where: {industryName: body.industryName}, raw: true });
    
    if(user) {
        throw new BadRequestError("industry name already exists");
    }

    let industryStatus = body.industryStatus == 1 ? 'Active' : 'Inactive';
    let industryData = {
        industryName: body.industryName,
        industryRemarks: body.industryRemarks,
        industryStatus: industryStatus
    }

    await IndustryModel.create(industryData);

    return {slides : 'Industry created successfully'};
}

let GetIndustry = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let allUser = await IndustryModel.findAll({
        limit,
        offset,
        order: [['industryID', 'DESC']],
        raw: true
    });
    let allUserCount = await IndustryModel.count({        
        order: [['industryID', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.slides = allUser;
    _result.total_count = allUserCount;
    return _result;
}

let ChangeIndustryStatus = async (body) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("body_empty");
    }

    if (helper.undefinedOrNull(body.industryID)) {
        throw new BadRequestError("User ID is required");
    }
    if (helper.undefinedOrNull(body.status)) {
        throw new BadRequestError("Status is required");
    }

    let industry = await IndustryModel
        .findOne({ where: {industryID : body.industryID}, raw: true });
    if (!industry) {
        throw new BadRequestError("invalid_creds");
    }
    if(industry.industryStatus == 'Active' && body.status == 1) {
        throw new BadRequestError("Already activated"); 
    }
    if(industry.industryStatus == 'Inactive' && body.status != 1) {
        throw new BadRequestError("Already inactivated"); 
    }
    let status = body.status == 1 ? 'Active' : 'Inactive'
    await IndustryModel.update({industryStatus : status}, { where: {industryID : industry.industryID},  raw: true });
    return { status : body.status }    
}

let IndustryDetail = async (req) => {
    if(!req.params.industryID) {
        throw new BadRequestError("industryID is required");
    }
    let IndustryData = await IndustryModel.findOne({
        where: {industryID : req.params.industryID},
        raw: true
    });
    return {slides : IndustryData};
}

let IndustryUpdate = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("body_empty");
    }
    ['industryName', 'industryRemarks'].forEach(x => {
        if (!body[x]) {
            throw new BadRequestError(x + " is required");
        }
    });
    let updateData = {};
    let optionalFiled = ['industryName', 'industryRemarks','industryStatus'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });
    await IndustryModel.update(updateData, { where: { industryID: req.params.industryID }, raw: true });
    let  industry = await IndustryModel.findOne({where:{industryID: req.params.industryID},raw:true});
        
    return {slides : industry}
}


module.exports = {
    CreateIndustry : CreateIndustry,
    GetIndustry : GetIndustry,
    ChangeIndustryStatus : ChangeIndustryStatus,
    IndustryDetail:IndustryDetail,
    IndustryUpdate:IndustryUpdate
};
