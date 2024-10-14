let serviceFeedbackManager = require('../manager/upcoming_service_feedback');

let ServiceFeedbackList = (req, res, next) => {
    return serviceFeedbackManager
        .ServiceFeedbackList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let ServiceFeedbackDetail = (req, res, next) => {
    return serviceFeedbackManager
        .ServiceFeedbackDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let ServiceFeedbackUsers = (req, res, next) => {
    return serviceFeedbackManager
        .ServiceFeedbackUsers(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let DeleteFeedback = (req, res, next) => {
    return serviceFeedbackManager
        .DeleteFeedback(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpdateServiceFeedback = (req, res, next) => {

    return serviceFeedbackManager
        .UpdateServiceFeedback(req)
        .then(data => {
            
            console.log(data);

            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}


module.exports = {
    ServiceFeedbackList: ServiceFeedbackList,
    ServiceFeedbackDetail: ServiceFeedbackDetail,
    ServiceFeedbackUsers: ServiceFeedbackUsers,
    DeleteFeedback: DeleteFeedback,
    UpdateServiceFeedback: UpdateServiceFeedback,
 };