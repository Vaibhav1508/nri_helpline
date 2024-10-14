let upcomingServiceManager = require('../manager/upcoming_service');

let CreateUpcomingService = (req, res, next) => {
    return upcomingServiceManager
        .CreateUpcomingService(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

let UpcomingServiceList = (req, res, next) => {
    return upcomingServiceManager
        .UpcomingServiceList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpdateUpcomingService = (req, res, next) => {
    return upcomingServiceManager
        .UpdateUpcomingService(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpcomingServiceDetail = (req, res, next) => {
    return upcomingServiceManager
        .UpcomingServiceDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let DeleteUpcomingService = (req, res, next) => {
    return upcomingServiceManager
        .DeleteUpcomingService(req)
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
    CreateUpcomingService: CreateUpcomingService,
    UpcomingServiceList: UpcomingServiceList,
    UpdateUpcomingService: UpdateUpcomingService,
    UpcomingServiceDetail: UpcomingServiceDetail,
    DeleteUpcomingService: DeleteUpcomingService
 };