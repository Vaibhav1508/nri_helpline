let notificationManager = require('../manager/push_notification');

let SendNotification = (req, res, next) => {
    return notificationManager
        .SendNotification(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

let NotificationList = (req, res, next) => {
    return notificationManager
        .NotificationList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let NotificationDetail = (req, res, next) => {
    return notificationManager
        .NotificationDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

module.exports = {
    SendNotification: SendNotification,
    NotificationList: NotificationList,
    NotificationDetail: NotificationDetail
 };