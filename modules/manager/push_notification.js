'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    PushNotificationsModel = require("../models/Push_notification"),
    UserPushNotificationsModel = require("../models/User_push_notification"),
    UserModel = require("../models/User"),
    NewsModel = require("../models/News"),
    CategoryModel = require("../models/Category"),
    TagsModel = require("../models/Tags"),
    NewsTagsModel = require("../models/News_tag"),
    { sendFirebaseNotification } = require("../helpers/send_push_notification"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');
    const { Op } = require('sequelize');
    let newsManager = require("./news") 

let SendNotification = async (req,i_user_id="") => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty.");
    }
    if(!body.e_type) {
        throw new BadRequestError("Notification type is required.");
    }
    if(!body.v_title) {
        throw new BadRequestError("Notification title is required.");
    }
    if(!body.t_message) {
        throw new BadRequestError("Notification message is required.");
    }

    let notificationData = {
        e_type: body.e_type,
        v_title: body.v_title,
        t_message: body.t_message
    }

    let filename = "";
    try {
        filename = req.file.filename;
    }
    catch (error) {
    }

    if(filename && filename != "") {
        notificationData['v_image'] = filename
    }
    let addedNotification = await addNotificationRecordInDB(notificationData,i_user_id) 

    return {notification : addedNotification};
}

let NotificationList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {e_type : 'Admin','i_upcoming_service_feedback_id':null}
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$or"] = [
                    {v_title: {$like: '%' + body.filters.searchtext + '%'}},
                    {t_message: {$like: '%' + body.filters.searchtext + '%'}},
                ]
        }
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
            const startDateFormatted = new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 00:00:00';
            const endDateFormatted = new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59:59';
    
            findData['created_at'] = {
                [Op.between]: [startDateFormatted, endDateFormatted]
            };
        }
    }
    let allNotification = await PushNotificationsModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true
    });
    for(let i=0 ; i<allNotification.length; i++) {
        if(allNotification[i].e_type == 'Admin') {
            allNotification[i].v_image_path = allNotification[i].v_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.notification_image_folder + allNotification[i].v_image : null;
        } else if(allNotification[i].e_type == 'News') {
            allNotification[i].v_image_path = allNotification[i].v_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + allNotification[i].v_image : null;
        }
    }
    let allNotificationCount = await PushNotificationsModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });
    let _result = { total_count: 0 };
    _result.notification = allNotification;
    _result.total_count = allNotificationCount;
    return _result;
}

let NotificationDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("Notification ID is required.");
    }
    let notificationData = await PushNotificationsModel.findOne({
        where: {id : req.params.id},
        raw: true
    });

    if(notificationData.e_type == 'Admin') {
        notificationData.v_image_path = notificationData.v_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.notification_image_folder + notificationData.v_image : null;
    } else if(notificationData.e_type == 'News') {
        notificationData.v_image_path = notificationData.v_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + notificationData.v_image : null;
    }

    if(!notificationData) {
        throw new BadRequestError('Notification detail not exist')
    }

    let userStatistics = await UserPushNotificationsModel.findAll({
        where: {i_push_notification_id : req.params.id},
        raw: true
    });

    let sent_to_total_user = userStatistics?.length ? userStatistics?.length : 0 

    let read_by_count =  userStatistics?.filter(user => user?.e_status == 'Read')?.length

    let not_read_by_count =  userStatistics?.filter(user => user?.e_status == 'Unread')?.length

    
    return {
        notification : notificationData,
        sent_to_total_user: sent_to_total_user,
        read_by_count: read_by_count ? read_by_count : 0,
        not_read_by_count: not_read_by_count ? not_read_by_count : 0
    };
}

let addNotificationRecordInDB = async (notificationData,i_user_id='',i_service_feedback_id='') => {
    console.log(notificationData);
    
    let pushNotificationDetail = await PushNotificationsModel.create(notificationData);
    
    let activeUsersList;

    console.log("In:;");

    console.log("User id"+i_user_id);

    if(i_user_id > 0 && i_user_id != "")
    {
        console.log("User id In ");
        activeUsersList = await UserModel.findAll({
            where: {e_status : 'Active',id :i_user_id, v_device_token: {
                [Op.not]: null
            }},
            raw: true
        });

        console.log(activeUsersList.length);

    }
    else
    {    
        activeUsersList = await UserModel.findAll({
            where: {e_status : 'Active', v_device_token: {
                [Op.not]: null
            }},
            raw: true
        });
    }

    activeUsersList = activeUsersList.map(x => x.id)

    let userPushNotificationData = []

    for(let i=0; i<activeUsersList?.length; i++) {
        userPushNotificationData.push({
            i_push_notification_id: pushNotificationDetail.id,
            i_user_id : activeUsersList[i],
            i_news_id: notificationData.i_news_id ? notificationData.i_news_id : null
        })
    }

    let v_image_path = ""; 
    let newsData;
    if(notificationData.e_type == 'Admin') {
        v_image_path = notificationData.v_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.notification_image_folder + notificationData.v_image : null;
        // v_image_path = "https://picsum.photos/536/354";
    } else if(notificationData.e_type == 'News') {
        newsData = await NewsModel.findOne({
            where: { id: notificationData.i_news_id },
            include: [
              {
                model: CategoryModel,
                as: 'category', // Use the correct alias if you've defined one
              },
            ],
            raw: true,
          });

        newsData.category = {}; 
        newsData.category["id"] = newsData['category.id']
        newsData.category["v_name"] = newsData['category.v_name']
        newsData.category["v_image_name"] = newsData['category.v_image_name']
        newsData.category["i_order"] = newsData['category.i_order']
        newsData.category["e_type"] = newsData['category.e_type']
        newsData.category["e_status"] = newsData['category.e_status']
        newsData.category["v_image_path"] = newsData['category.v_image_name'] ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + newsData['category.v_image_name'] : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
        newsData.category["created_at"] = newsData['category.created_at']
        newsData.category["updated_at"] = newsData['category.updated_at']

        delete newsData['category.id'];
        delete newsData['category.v_name'];
        delete newsData['category.e_type'];
        delete newsData['category.v_image_name'];
        delete newsData['category.i_order'];
        delete newsData['category.e_status'];
        delete newsData['category.created_at'];
        delete newsData['category.updated_at'];
    
        let tagIds = await NewsTagsModel.findAll({
            where: {i_category_news_id : notificationData.i_news_id},
            raw: true
        });
    
        tagIds = tagIds.map(x => x.i_tag_id)
    
        let tagsObj = await TagsModel.findAll({
            where: {id : tagIds},
            raw: true
        });
    
        newsData.tags = tagsObj
    
        newsData.v_image_path = newsData.v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + newsData.v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + 'NO_IMAGE_FOUND.jpg';
    } 

    await sendFirebaseNotification(notificationData?.v_title, notificationData?.t_message, v_image_path, notificationData.e_type, notificationData.i_news_id, newsData,i_user_id)

    await UserPushNotificationsModel.bulkCreate(userPushNotificationData, { raw: true });

    return pushNotificationDetail;
}

module.exports = {
    SendNotification:SendNotification,
    NotificationList: NotificationList,
    addNotificationRecordInDB: addNotificationRecordInDB,
    NotificationDetail: NotificationDetail
}