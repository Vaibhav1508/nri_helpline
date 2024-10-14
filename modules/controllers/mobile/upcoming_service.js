let submitFeedbackManager = require('../../manager/mobile/upcoming_service');

let SubmitFeedback = (req, res, next) => {
    return submitFeedbackManager
        .SubmitFeedback(req.body,req)
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

let UpcomingServiceFeedbacks = (req, res, next) => {
    return submitFeedbackManager
        .UpcomingServiceFeedbackList(req.body,req)
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
    SubmitFeedback: SubmitFeedback,
    UpcomingServiceFeedbacks: UpcomingServiceFeedbacks
};