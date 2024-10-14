'use strict';


let helper = require("../../helpers/helpers"),
    _ = require("lodash"),
    config = process.config.global_config,
    UpcomingServicesModel = require("../../models/Upcoming_services"),
    UpcomingServiceFeedbacksModel = require("../../models/Upcoming_service_feedbacks"),
    BadRequestError = require('../../errors/badRequestError');

let SubmitFeedback = async (body,req) => {
    if (helper.undefinedOrNull(body)) {
        return { status : 400, message: "Request body comes empty." }
    }
    if(!req.user.userId) {
        return { status : 400, message: "token is required." }
    }
    if(!body.i_upcoming_service_id) {
        return { status : 400, message: "i_upcoming_service_id is required." }
    }
    if(!body.t_service_feedback_text) {
        return { status : 400, message: "t_service_feedback_text is required." }
    }
    if(!body.v_email_id) {
        return { status : 400, message: "v_email_id is required." }
    }

    let upcomingService = await UpcomingServicesModel
        .findOne({ where: {id: body.i_upcoming_service_id}, raw: true });
    
    if(!upcomingService) {
        return { status : 400, message: "Upcoming service not found." }
    }

    // let existFeedback = await UpcomingServiceFeedbacksModel
    //     .findOne({ where: { i_upcoming_service_id : body.i_upcoming_service_id, i_user_id : req.user.userId }, raw: true });
    
    // if(existFeedback) {
    //     return { status : 400, message: "User has already submitted feedback for this upcoming service." }
    // }

    let feedbackData = {
        i_upcoming_service_id : body.i_upcoming_service_id,
        i_user_id: req.user.userId,
        t_service_feedback_text : body.t_service_feedback_text,
        v_email_id : body.v_email_id
    }

    let feedbackDetail = await UpcomingServiceFeedbacksModel.create(feedbackData);

    return { feedback : feedbackDetail};
}


let UpcomingServiceFeedbackList = async (body,req) => {

    if(!req.user.userId) {
        return { status : 400, message: "token is required." }
    }

    let limit = (body.limit && parseInt(body.limit) > 0) ? parseInt(body.limit) : 10;
    let page = body.page && parseInt(body.page) > 0 ? body.page : 1;
    let offset = (page - 1) * limit;
    let findData = {i_user_id : req.user.userId}

    let upcomingServiceFeedbackList = await UpcomingServiceFeedbacksModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true,
        include: [
            {
              model: UpcomingServicesModel, // The associated model
              as: 'upcomin_service', // The alias of the association (if you defined one)
            },
        ],
    });

    let upcomingServiceFeedbackCount = await UpcomingServiceFeedbacksModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });

    
    let _result = { total_count: 0 };
    _result.upcoming_service_feedbacks = upcomingServiceFeedbackList;
    _result.total_count = upcomingServiceFeedbackCount;
    return _result;


}
module.exports = {
    SubmitFeedback: SubmitFeedback,
    UpcomingServiceFeedbackList:UpcomingServiceFeedbackList
}