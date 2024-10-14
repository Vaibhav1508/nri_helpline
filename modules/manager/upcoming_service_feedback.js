'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    ServiceFeedbackModel = require("../models/Upcoming_service_feedbacks"),
    UserModel = require("../models/User"),
    CountryModel = require("../models/Countries"),
    UpcomingServiceModel = require("../models/Upcoming_services"),
    fs = require("fs"),
    PushNotificationManager = require("../manager/push_notification"),
    BadRequestError = require('../errors/badRequestError');
    const { Op } = require('sequelize');

let ServiceFeedbackList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$or"] = [
                    {t_service_feedback_text: {$like: '%' + body.filters.searchtext + '%'}},
                    {v_email_id: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    if(body.i_service_id) {
        findData['i_upcoming_service_id'] = body.i_service_id
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
    
            // Format the dates as 'YYYY-MM-DD HH:MM:SS' for your database
            const startDateFormatted = new Date(startDate).toISOString().split('T')[0] + ' 00:00:00';
            const endDateFormatted = new Date(endDate).toISOString().split('T')[0] + ' 23:59:59';
    
            findData['created_at'] = {
                [Op.between]: [startDateFormatted, endDateFormatted]
            };
        }
    }
    let allServiceFeedback = await ServiceFeedbackModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        include: [
            {
              model: UpcomingServiceModel, // The associated model
              as: 'upcomin_service', // The alias of the association (if you defined one)
            },
        ],
        raw: true
    });
    let country = await CountryModel.findAll({
        where: {},
        raw: true
    });
    for(let i=0;i<allServiceFeedback?.length; i++) {
        let user = await UserModel.findOne({where: {id : allServiceFeedback[i]?.i_user_id}, raw: true})
        if(country.filter(x => x.id == user?.i_country_id).length > 0) {
            user.country = country.filter(x => x.id == user?.i_country_id)[0]
        }
        allServiceFeedback[i].user = user
    }
    let allServiceFeedbackCount = await ServiceFeedbackModel.count({   
        where: findData, 
        order: [['id', 'DESC']],
        raw: true
    });
    if(body.i_user_id) {
        allServiceFeedback = allServiceFeedback.filter(x => x.i_user_id == body.i_user_id)
        allServiceFeedbackCount = allServiceFeedback?.length 
    }
    allServiceFeedback = allServiceFeedback.filter(x => x?.user?.id)
    let _result = { total_count: 0 };
    _result.service_feedback = allServiceFeedback;
    _result.total_count = allServiceFeedbackCount;
    return _result;
}

let ServiceFeedbackDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("ServiceFeedbackID is required");
    }
    let serviceFeedbackDetail = await ServiceFeedbackModel.findOne({
        where: {id : req.params.id},
        include: [
            {
              model: UpcomingServiceModel, // The associated model
              as: 'upcomin_service', // The alias of the association (if you defined one)
            },
        ],
        raw: true
    });
    if(!serviceFeedbackDetail) {
        throw new BadRequestError("ServiceFeedback not available")
    }
    let country = await CountryModel.findAll({
        where: {},
        raw: true
    });
    let user = await UserModel.findOne({where: {id : serviceFeedbackDetail.i_user_id}, raw: true})
    user.country = country.filter(x => x.id == user.i_country_id)[0]
    serviceFeedbackDetail.user = user
    
    return {service_feedback : serviceFeedbackDetail};
}

let ServiceFeedbackUsers = async (req) => {
    let feedBacks = await ServiceFeedbackModel.findAll({
        where: {},
        raw: true
    });

    let user_ids = feedBacks.map(x => x.i_user_id)
    let serviceFeedbackUser = await UserModel.findAll({
        where: {id : user_ids},
        raw: true
    });
    
    let country = await CountryModel.findAll({
        where: {},
        raw: true
    });

    for(let i=0;i<serviceFeedbackUser?.length; i++) {
        serviceFeedbackUser[i].country = country.filter(x => x.id == serviceFeedbackUser[i]?.i_country_id)[0]
    }
    
    return {service_feedback_users : serviceFeedbackUser};
}

let DeleteFeedback = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if(!body.selected_ids?.length) {
        throw new BadRequestError("Feedback ID is required.");
    }
    
    await ServiceFeedbackModel.destroy({
        where: {id : body.selected_ids},
        raw: true
    });
    
    return {message : 'Feedback deleted successfully.'};
}


let UpdateServiceFeedback = async (req) => {
    
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;

    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    if (!body.t_admin_reply_text) {
        throw new BadRequestError("Replay admin text is required");
    }
    
    let ServiceFeedbackModels = await ServiceFeedbackModel
        .findAll({ where: {id: req.params.id}, raw: true });
    
    if(!ServiceFeedbackModels.filter(x => x.id == req.params.id).length > 0) {
        throw new BadRequestError("Service feedback doesn't exists");
    }
    
    let updateData = {};
    let optionalFiled = ['t_admin_reply_text'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });

    updateData["e_is_admin_reply"] = "Yes";

    updateData["d_admin_reply_date"] = Date.now();
    
    updateData["updated_at"] = Date.now();
    try {
        console.log("11");

        await ServiceFeedbackModel.update(updateData, { where: { id: req.params.id }, raw: true });
        let ServiceFeedbackData = await ServiceFeedbackModel.findOne({where:{id: req.params.id},raw:true});


        let UpcomingServiceData = await UpcomingServiceModel.findOne({where:{id: ServiceFeedbackData.i_upcoming_service_id},raw:true});


        let notificationData = {
            i_upcoming_service_feedback_id: req.params.id,
            e_type: 'Admin',
            v_title: 'Admin has replied to your '+UpcomingServiceData.v_name+' service request.',
            v_message: ''
        }

        await PushNotificationManager.addNotificationRecordInDB(notificationData,ServiceFeedbackData.i_user_id,req.params.id)
        
        return {service_feedback : ServiceFeedbackData}
    } catch(err) {
        if(err.parent.code == 'ER_DUP_ENTRY') {
            throw new BadRequestError("Record with this name is already exist")
        }
    }
    
}
module.exports = {
    ServiceFeedbackList: ServiceFeedbackList,
    ServiceFeedbackDetail: ServiceFeedbackDetail,
    ServiceFeedbackUsers: ServiceFeedbackUsers,
    DeleteFeedback: DeleteFeedback,
    UpdateServiceFeedback: UpdateServiceFeedback
}