'use strict';


let _ = require("lodash"),
    config = process.config.global_config,
    PushNotificationsModel = require("../../models/Push_notification"),
    UserPushNotificationsModel = require("../../models/User_push_notification"),
    NewsModel = require("../../models/News"),
    UpcomingServiceFeedbacksModel = require("../../models/Upcoming_service_feedbacks"),
    NewsTagsModel = require("../../models/News_tag"),
    TagsModel = require("../../models/Tags"),
    CategoryModel = require("../../models/Category"),
    UpcomingServicesModel = require("../../models/Upcoming_services"),
    BadRequestError = require('../../errors/badRequestError');

    let NotificationList = async (body,req) => {
        if(!req.user.userId) {
            return { status : 400, message: "token is required." }
        }
        let limit = (body.limit && parseInt(body.limit) > 0) ? parseInt(body.limit) : 10;
        let page = body.page && parseInt(body.page) > 0 ? body.page : 1;
        let offset = (page - 1) * limit;
        let findData = {i_user_id : req.user.userId}
        
        if(body.e_status) {
            findData['e_status'] = body.e_status
        }
        let userNotifications = await UserPushNotificationsModel.findAll({
            where: findData,
            order: [['id', 'DESC']],
            raw: true,
        });

        let userNotificationsIDs = userNotifications.map(x => x.i_push_notification_id)
        
        let notificationsList = await PushNotificationsModel.findAll({
            where: {id : userNotificationsIDs},
            limit,
            offset,
            order: [['id', 'DESC']],
            raw: true,
        }); 

        let allUpcomingServiceFeedbacks = "";
        try
        {
            allUpcomingServiceFeedbacks = await UpcomingServiceFeedbacksModel.findAll({
                where: {'e_is_admin_reply':'Yes'},
                include: [
                    {
                    model: UpcomingServicesModel, // The associated model
                    as: 'upcomin_service', // The alias of the association (if you defined one)
                    },
                ],
                raw: true,
            });
        }
        catch(error)
        {
            console.log(error);
        }

        let allNews = await NewsModel.findAll({
            where: {e_status : 'Active'},
            include: [
                {
                  model: CategoryModel, // The associated model
                  as: 'category', // The alias of the association (if you defined one)
                },
              ],
            raw: true,
        });
        
        for(let i=0 ; i<notificationsList.length; i++) {
            if(notificationsList[i].e_type == 'Admin') {
                notificationsList[i].v_image_path = notificationsList[i].v_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.notification_image_folder + notificationsList[i].v_image : null;
            } else if(notificationsList[i].e_type == 'News') {
                notificationsList[i].v_image_path = notificationsList[i].v_image ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + notificationsList[i].v_image : null;
                notificationsList[i].news = allNews?.filter(news => news?.id == notificationsList[i]?.i_news_id)[0]
            }


            if(notificationsList[i].i_upcoming_service_feedback_id > 0)
            {
                notificationsList[i].upcoming_service_feedback = allUpcomingServiceFeedbacks?.filter(allUpcomingServiceFeedback => allUpcomingServiceFeedback?.id == notificationsList[i]?.i_upcoming_service_feedback_id)[0]
            }
        }
        for(let i=0 ; i<allNews.length; i++) {
            allNews[i].v_image_path = allNews[i].v_image_name ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.news_image_folder + allNews[i].v_image_name : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
            let tagIds = await NewsTagsModel.findAll({
                where: {i_category_news_id : allNews[i].id},
                raw: true
            });

            allNews[i].category = {}; 
            allNews[i].category['id'] = allNews[i]['category.id']
            allNews[i].category['v_name'] = allNews[i]['category.v_name']
            allNews[i].category['v_image_name'] = allNews[i]['category.v_image_name']
            allNews[i].category['i_order'] = allNews[i]['category.i_order']
            allNews[i].category['e_status'] = allNews[i]['category.e_status']
            allNews[i].category['v_image_path'] = allNews[i]['category.v_image_name'] ? process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.category_image_folder + allNews[i]['category.v_image_name'] : process.env.BASE_URL +'/'+ config.upload_folder + config.upload_entities.profile_image_folder + 'NO_IMAGE_FOUND.jpg';
            allNews[i].category['created_at'] = allNews[i]['category.created_at']
            allNews[i].category['updated_at'] = allNews[i]['category.updated_at']

            delete allNews[i]['category.id'];
            delete allNews[i]['category.v_name'];
            delete allNews[i]['category.v_image_name'];
            delete allNews[i]['category.i_order'];
            delete allNews[i]['category.e_status'];
            delete allNews[i]['category.created_at'];
            delete allNews[i]['category.updated_at'];
        
            tagIds = tagIds.map(x => x.i_tag_id)
        
            let tagsObj = await TagsModel.findAll({
                where: {id : tagIds},
                raw: true
            });
        
            allNews[i].tags = tagsObj
        }

        notificationsList = notificationsList.map(notification => {
            const matchingUserNotification = userNotifications.find(
              x => x.i_push_notification_id === notification.id && x.i_user_id === req.user.userId
            );
            if (matchingUserNotification) {
              notification.e_status = matchingUserNotification.e_status;
            }
            return notification;
          });

        let notificationCount = await PushNotificationsModel.count({   
            where: {id : userNotificationsIDs},     
            order: [['id', 'DESC']],
            raw: true
        });
    
        let _result = { total_count: 0 };
        _result.notifications = notificationsList;
        _result.total_count = notificationCount;
        return _result;
    }

    let NotificationRead = async (body,req) => {
        if(!req.user.userId) {
            return { status : 400, message: "token is required." }
        }

        let e_type = (body.e_type && body.e_type != "") ? body.e_type : 'Notification';

        let updatedNotification;
        if(body?.i_push_notification_id?.length > 0) {
            
            if(e_type == 'News')
            {
                updatedNotification = await UserPushNotificationsModel.update({e_status : 'Read'}, {
                    where: { i_user_id: req.user.userId, i_news_id: body?.i_push_notification_id },
                    raw: true,
                });
            }
            else
            {
                updatedNotification = await UserPushNotificationsModel.update({e_status : 'Read'}, {
                    where: { i_user_id: req.user.userId, i_push_notification_id: body?.i_push_notification_id },
                    raw: true,
                });   
            }

        } else {
            updatedNotification = await UserPushNotificationsModel.update({e_status : 'Read'}, {
                where: {i_user_id: req.user.userId},
                raw: true,
            });
        }
        return {notifications_updated : true, message : 'Notification status updated successfully.'};
    }

module.exports = {
    NotificationList: NotificationList,
    NotificationRead: NotificationRead
}