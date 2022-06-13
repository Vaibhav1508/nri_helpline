'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    VocationModel = require("../models/Vocation"),
    SubVocationModel = require("../models/SubVocation"),
    UserVocationModel = require("../models/User_vocations"),
    BadRequestError = require('../errors/badRequestError');
const { v4: uuidv4 } = require('uuid');
const { use } = require("../routes/Users");
    


// let generateAuthToken = async (phone) => {
//     return uuidv4();
// }

let CreateVocation = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    ['vocationName'].forEach(x => {
        if (!body[x]) {
            throw new BadRequestError(x + " is required");
        }
    });

    let user = await VocationModel
        .findOne({ where: {vocationName: body.vocationName}, raw: true });
    
    if(user) {
        throw new BadRequestError("Vocation name already exists");
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

    // if(user.vocationStatus == 'Active' && body.status == 1) {
    //     throw new BadRequestError("Already activated"); 
    // }
    // if(user.vocationStatus == 'Inactive' && body.status != 1) {
    //     throw new BadRequestError("Already inactivated"); 
    // }
    let vocationStatus = body.vocationStatus == 1 ? 'Active' : 'Inactive';
    let vocationData = {
        vocationImage: filename,
        vocationName: body.vocationName,
        vocationRemarks: body.vocationRemarks,
        vocationStatus: vocationStatus
    }

    let vocationDetail = await VocationModel.create(vocationData);
    vocationDetail.vocationImage = config.upload_folder + config.upload_entities.vocation_image_folder + vocationDetail.vocationImage;

    return {slides : vocationDetail};
}

let CreateSubVocation = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    [ 'vocationID' ,'subVocationName'].forEach(x => {
        if (!body[x]) {
            throw new BadRequestError(x + " is required");
        }
    });

    let user = await VocationModel
        .findOne({ where: { vocationID: body.vocationID}, raw: true });
    
    if(!user) {
        throw new BadRequestError("Selected vocation doesn't exists");
    }
    
    let subvocation = await SubVocationModel
        .findOne({ where: { subVocationName: body.subVocationName}, raw: true });

    if(subvocation){
        throw new BadRequestError("Subvocation name already exists")
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

    // if(user.vocationStatus == 'Active' && body.status == 1) {
    //     throw new BadRequestError("Already activated"); 
    // }
    // if(user.vocationStatus == 'Inactive' && body.status != 1) {
    //     throw new BadRequestError("Already inactivated"); 
    // }
    let subVocationStatus = body.subVocationStatus == 1 ? 'Active' : 'Inactive';
    let subVocationData = {
        subVocationImage: filename,
        vocationID: body.vocationID,
        subVocationName: body.subVocationName,
        subVocationRemarks: body.subVocationRemarks,
        subVocationStatus: subVocationStatus
    }
    let subVocationDetail = await SubVocationModel.create(subVocationData);
    subVocationDetail.subvocationImage = config.upload_folder + config.upload_entities.sub_vocation_image_folder + subVocationDetail.vocationImage;

    return {slides : subVocationDetail};
}

let VocationsList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {vocationStatus : 'Active'}
        if (body.filters) {
            if (body.filters.searchtext) {
					findData["$and"] = [
						{vocationName: {$like: '%' + body.filters.searchtext + '%'}}
					]
            }
        }
    if(body.page || body.limit) {
       let allVocation = await VocationModel.findAll({
            where: findData,
            limit,
            offset,
            order: [['vocationID', 'DESC']],
            raw: true
        });
        for(let i=0 ; i<allVocation.length; i++) {
            allVocation[i].vocationImage = config.upload_folder + config.upload_entities.vocation_image_folder + allVocation[i].vocationImage;
        }
        let allVocationCount = await VocationModel.count({   
            where: findData,     
            order: [['vocationID', 'DESC']],
            raw: true
        });
        let _result = { total_count: 0 };
        _result.slides = allVocation;
        _result.total_count = allVocationCount;
        return _result;
    }   else {
        let allVocation = await VocationModel.findAll({
            where: findData,
            order: [['vocationID', 'DESC']],
            raw: true
        });
        for(let i=0 ; i<allVocation.length; i++) {
            allVocation[i].vocationImage = config.upload_folder + config.upload_entities.vocation_image_folder + allVocation[i].vocationImage;
        }
        let allVocationCount = await VocationModel.count({        
            order: [['vocationID', 'DESC']],
            raw: true
        });
        let _result = { total_count: 0 };
        _result.slides = allVocation;
        _result.total_count = allVocationCount;
        return _result;
    } 
    
}

let AdminVocationsList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
        if (body.filters) {
            if (body.filters.searchtext) {
					findData["$and"] = [
						{vocationName: {$like: '%' + body.filters.searchtext + '%'}}
					]
            }
        }
    if(body.page || body.limit) {
       let allVocation = await VocationModel.findAll({
            where: findData,
            limit,
            offset,
            order: [['vocationID', 'DESC']],
            raw: true
        });
        for(let i=0 ; i<allVocation.length; i++) {
            allVocation[i].vocationImage = config.upload_folder + config.upload_entities.vocation_image_folder + allVocation[i].vocationImage;
        }
        let allVocationCount = await VocationModel.count({   
            where: findData,     
            order: [['vocationID', 'DESC']],
            raw: true
        });
        let _result = { total_count: 0 };
        _result.slides = allVocation;
        _result.total_count = allVocationCount;
        return _result;
    }   else {
        let allVocation = await VocationModel.findAll({
            where: findData,
            order: [['vocationID', 'DESC']],
            raw: true
        });
        for(let i=0 ; i<allVocation.length; i++) {
            allVocation[i].vocationImage = config.upload_folder + config.upload_entities.vocation_image_folder + allVocation[i].vocationImage;
        }
        let allVocationCount = await VocationModel.count({        
            order: [['vocationID', 'DESC']],
            raw: true
        });
        let _result = { total_count: 0 };
        _result.slides = allVocation;
        _result.total_count = allVocationCount;
        return _result;
    } 
    
}

let SubVocationsList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {subVocationStatus : 'Active'}
        if (body.filters) {
            if (body.filters.searchtext) {
					findData["$or"] = [
						{subVocationName: {$like: '%' + body.filters.searchtext + '%'}}
					]
            }
        }
    let allSubVocation = await SubVocationModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['subVocationID', 'DESC']],
        raw: true
    });
    for(let i=0; i < allSubVocation.length; i++) {
        let vocationName =  await VocationModel.findOne({where : {vocationID : allSubVocation[i].vocationID}},{
            raw: true
        });
        allSubVocation[i].vocationName = vocationName.vocationName
        allSubVocation[i].subVocationImage = config.upload_folder + config.upload_entities.sub_vocation_image_folder + allSubVocation[i].subVocationImage;
    }
    let allSubVocationCount = await SubVocationModel.count({   
        where: findData,     
        order: [['subVocationID', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.slides = allSubVocation;
    _result.total_count = allSubVocationCount;
    return _result;
}

let AdminSubVocationsList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
        if (body.filters) {
            if (body.filters.searchtext) {
					findData["$or"] = [
						{subVocationName: {$like: '%' + body.filters.searchtext + '%'}}
					]
            }
        }
    let allSubVocation = await SubVocationModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['subVocationID', 'DESC']],
        raw: true
    });
    for(let i=0; i < allSubVocation.length; i++) {
        let vocationName =  await VocationModel.findOne({where : {vocationID : allSubVocation[i].vocationID}},{
            raw: true
        });
        allSubVocation[i].vocationName = vocationName.vocationName
        allSubVocation[i].subVocationImage = config.upload_folder + config.upload_entities.sub_vocation_image_folder + allSubVocation[i].subVocationImage;
    }
    let allSubVocationCount = await SubVocationModel.count({   
        where: findData,     
        order: [['subVocationID', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.slides = allSubVocation;
    _result.total_count = allSubVocationCount;
    return _result;
}

let UserSelectVocation = async (body) => {
    if (!body.userID) {
        throw new BadRequestError('userID is required.');
    }
    if (!body.vocationID.length) {
        throw new BadRequestError('vocationID is required.');
    }
   await UserVocationModel
    .destroy({ where: {userID: body.userID}, raw: true });

    for(let i=0; i < body.vocationID.length; i++ ) {
        let vocation = await VocationModel
        .findOne({ where: {vocationID : body.vocationID[i]}, raw: true });
        if(vocation) {
            let vocationData = {
                userID: body.userID,
                vocationID: vocation.vocationID,
                uservocationStatus : vocation.vocationStatus
            }
            if(vocationData) {
                await UserVocationModel.create(vocationData);
            }
        }
    }

    return {message : 'Successfully updated.'}

}

let ChangeVocationStatus = async (body) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }

    if (helper.undefinedOrNull(body.vocationID)) {
        throw new BadRequestError("User ID is required");
    }
    if (helper.undefinedOrNull(body.status)) {
        throw new BadRequestError("Status is required");
    }

    let user = await VocationModel
        .findOne({ where: {vocationID : body.vocationID}, raw: true });
    if (!user) {
        throw new BadRequestError("invalid_creds");
    }
    if(user.vocationStatus == 'Active' && body.status == 1) {
        throw new BadRequestError("Vocation Already activated"); 
    }
    if(user.vocationStatus == 'Inactive' && body.status != 1) {
        throw new BadRequestError("Vocation Already inactivated"); 
    }
    let status = body.status == 1 ? 'Active' : 'Inactive'
    await VocationModel.update({vocationStatus : status}, { where: {vocationID : user.vocationID},  raw: true });
    return { status : body.status }    
}

let ChangeSubVocationStatus = async (body) => {
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }

    if (helper.undefinedOrNull(body.subVocationID)) {
        throw new BadRequestError("subVocationID ID is required");
    }
    if (helper.undefinedOrNull(body.status)) {
        throw new BadRequestError("Status is required");
    }

    let user = await SubVocationModel
        .findOne({ where: {subVocationID : body.subVocationID}, raw: true });
    if (!user) {
        throw new BadRequestError("invalid_creds");
    }
    if(user.subVocationStatus == 'Active' && body.status == 1) {
        throw new BadRequestError("Sub Vocation Already activated"); 
    }
    if(user.subVocationStatus == 'Inactive' && body.status != 1) {
        throw new BadRequestError("Sub Vocation Already inactivated"); 
    }
    let status = body.status == 1 ? 'Active' : 'Inactive'
    await SubVocationModel.update({subVocationStatus : status}, { where: {subVocationID : user.subVocationID},  raw: true });
    return { status : body.status }    
}

let VocationDetail = async (req) => {
    if(!req.params.vocationID) {
        throw new BadRequestError("VocationID is required");
    }
    let vocationData = await VocationModel.findOne({
        where: {vocationID : req.params.vocationID},
        raw: true
    });
    vocationData.vocationImage = config.upload_folder + config.upload_entities.vocation_image_folder + vocationData.vocationImage;
    return {slides : vocationData};
}

let SubVocationDetail = async (req) => {
    if(!req.params.vocationID) {
        throw new BadRequestError("Sub VocationID is required");
    }
    let subvocationData = await SubVocationModel.findOne({
        where: {subVocationID : req.params.vocationID},
        raw: true
    });
    subvocationData.subVocationImage = config.upload_folder + config.upload_entities.sub_vocation_image_folder + subvocationData.subVocationImage;
    return {slides : subvocationData};
}

let VocationUpdate = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
        if (!body.vocationName) {
            throw new BadRequestError("vocationName is required");
        }

    let Vocation = await VocationModel
        .findOne({ where: {vocationID: req.params.vocationID}, raw: true });
    
    if(!Vocation) {
        throw new BadRequestError("Vocation doesn't exists");
    }

    let updateData = {};
    let optionalFiled = ['vocationID', 'vocationName','vocationRemarks','vocationStatus'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });
    if (req.file && req.file.path) {
        updateData["vocationImage"] = req.file.filename;
    }
    await VocationModel.update(updateData, { where: { vocationID: req.params.vocationID }, raw: true });
    let  vocationData = await VocationModel.findOne({where:{vocationID: req.params.vocationID},raw:true});
        
    return {slides : vocationData}
}

let SubVocationUpdate = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
        if (!body.subVocationName) {
            throw new BadRequestError("Sub vocationName is required");
        }

    let subVocation = await SubVocationModel
        .findOne({ where: {subVocationID: req.params.vocationID}, raw: true });
    
    if(!subVocation) {
        throw new BadRequestError("Sub vocation doesn't exists");
    }

    let updateData = {};
    let optionalFiled = ['subVocationName', 'subVocationRemarks','subVocationStatus','vocationID'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });
    if (req.file && req.file.path) {
        updateData["subVocationImage"] = req.file.filename;
    }
    await SubVocationModel.update(updateData, { where: { subVocationID: req.params.vocationID }, raw: true });
    let  subVocationData = await SubVocationModel.findOne({where:{subVocationID: req.params.vocationID},raw:true});
        
    return {slides : subVocationData}
}

let GetSuggetion = async (body) => {
    let subvocationData = await SubVocationModel.findAll({
        where: {vocationID : body.vocationID, subVocationStatus : 'Active'},
        raw: true
    });
    for(let i=0; i<subvocationData.length; i++) {
        subvocationData[i].subVocationImage = config.upload_folder + config.upload_entities.sub_vocation_image_folder + subvocationData[i].subVocationImage;
    }
    return {slides : subvocationData};
}

module.exports = {
    AdminVocationsList:AdminVocationsList,
    AdminSubVocationsList:AdminSubVocationsList,
    CreateVocation : CreateVocation,
    VocationsList: VocationsList,
    ChangeVocationStatus: ChangeVocationStatus,
    UserSelectVocation: UserSelectVocation,
    CreateSubVocation: CreateSubVocation,
    SubVocationsList: SubVocationsList,
    ChangeSubVocationStatus: ChangeSubVocationStatus,
    VocationDetail:VocationDetail,
    SubVocationDetail:SubVocationDetail,
    VocationUpdate:VocationUpdate,
    SubVocationUpdate:SubVocationUpdate,
    GetSuggetion:GetSuggetion
};
