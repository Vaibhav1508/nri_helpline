let questionManager = require('../manager/poll_questions');

let CreateQuestion = (req, res, next) => {
    return questionManager
        .CreateQuestion(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

let QuestionList = (req, res, next) => {
    return questionManager
        .QuestionList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpdateQuestion = (req, res, next) => {
    return questionManager
        .UpdateQuestion(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let QuestionDetail = (req, res, next) => {
    return questionManager
        .QuestionDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let DeleteQuestion = (req, res, next) => {
    return questionManager
        .DeleteQuestion(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let SurveyResult = (req, res, next) => {
    return questionManager
        .SurveyResult(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let SurveyResultDetail = (req, res, next) => {
    return questionManager
        .SurveyResultDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let PollUserList = (req, res, next) => {
    return questionManager
        .PollUserList(req.body)
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
    CreateQuestion: CreateQuestion,
    QuestionList: QuestionList,
    UpdateQuestion: UpdateQuestion,
    QuestionDetail: QuestionDetail,
    DeleteQuestion: DeleteQuestion,
    SurveyResult: SurveyResult,
    SurveyResultDetail: SurveyResultDetail,
    PollUserList: PollUserList
 };