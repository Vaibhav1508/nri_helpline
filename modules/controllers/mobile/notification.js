let NotificationManager = require('../../manager/mobile/notification');

let NotificationList = (req, res, next) => {
    return NotificationManager
        .NotificationList(req.body,req)
        .then(data => {
            let result = data.status ? {
                status: data.status,
                message: data.message,
            } :{
                status: 200,
                data: data,
            };
            return res.json(result);
        })
        .catch(next);
}

let NotificationRead = (req, res, next) => {
    return NotificationManager
        .NotificationRead(req.body,req)
        .then(data => {
            let result = data.status ? {
                status: data.status,
                message: data.message,
            } :{
                status: 200,
                data: data,
            };
            return res.json(result);
        })
        .catch(next);
}

module.exports = {
    NotificationList: NotificationList,
    NotificationRead: NotificationRead
 };