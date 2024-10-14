let questionsManager = require('../../manager/mobile/poll_questions');

let QuestionsList = (req, res, next) => {
    return questionsManager
        .QuestionsList(req.body,req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let QuestionsAnswer = (req, res, next) => {
    return questionsManager
        .QuestionsAnswer(req.body,req)
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
    QuestionsList: QuestionsList,
    QuestionsAnswer: QuestionsAnswer
};