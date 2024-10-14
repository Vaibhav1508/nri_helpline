'use strict';


let helper = require("../../helpers/helpers"),
    _ = require("lodash"),
    config = process.config.global_config,
    PollQuestionsModal = require("../../models/Poll_questions"),
    PollQuestionsOptionsModal = require("../../models/Poll_questions_options"),
    PollQuestionUserAnswerOptionsModal = require("../../models/Poll_question_user_answer_options"),
    PollQuestionUserAnswersModal = require("../../models/Poll_question_user_answers");
    const Sequelize = require('sequelize');
    
    function isFlattenRequired(arr) {
        // Check if any element in the array is an array
        return arr.some(Array.isArray);
    }

let QuestionsList = async (body,req) => {
    if(!req.user.userId) {
        return { status : 400, message: "token is required." }
    }

    // User attempted answer
    let userAttemptedQuestions = await PollQuestionUserAnswerOptionsModal.findAll({
        where: {i_user_id : req.user.userId},
        order: [['id', 'ASC']],
        raw: true
    })

    let attemptedIds = userAttemptedQuestions.map(x => x.i_poll_question_id)

    let allQuestions = await PollQuestionsModal.findAll({
        where: {id : {[Sequelize.Op.notIn]: attemptedIds}, e_status: 'Active'},
        order: [['i_order', 'ASC']],
        raw: true
    });

    let allQuestionsCount = await PollQuestionsModal.count({   
        where: {id : {[Sequelize.Op.notIn]: attemptedIds}, e_status: 'Active'},
        order: [['i_order', 'ASC']],
        raw: true
    });

    let options = await PollQuestionsOptionsModal.findAll({raw:true})
    for(let i=0 ; i<allQuestions.length; i++) {
        allQuestions[i].options = options.filter(x => x.poll_question_id == allQuestions[i].id)
    }

    let getQuestionDetail = await PollQuestionsModal.findAll({
        where: {id : attemptedIds, e_status: 'Active'},
        order: [['i_order', 'ASC']],
        raw: true
    });

    let allAttemptedQuestions = await PollQuestionUserAnswerOptionsModal.findAll({
        where: {},
        order: [['id', 'ASC']],
        raw: true
    })

    for(let i=0 ; i<getQuestionDetail.length; i++) {
        getQuestionDetail[i].options = options.filter(x => x.poll_question_id == getQuestionDetail[i].id)
        let totalAnsersGivenByUser = allAttemptedQuestions.filter(x => x.i_poll_question_id == getQuestionDetail[i].id)
        let totalOptionsSelectedByUser = totalAnsersGivenByUser.map(ans => ans.j_poll_question_option_id)

        totalOptionsSelectedByUser = totalOptionsSelectedByUser.map(JSON.parse);
        
        let flattenedData;
        const valueCounts = {};
        if (Array.isArray(totalOptionsSelectedByUser)) {
            flattenedData = totalOptionsSelectedByUser.flat()
        } else {
            flattenedData = totalOptionsSelectedByUser
        }

        // flattenedData = JSON.parse(flattenedData)
        flattenedData = flattenedData.map(JSON.parse);
        

        if (Array.isArray(flattenedData)) {
            flattenedData = flattenedData.flat()
        } else {
            flattenedData = flattenedData
        }
        
        flattenedData?.forEach(value => {
            if (valueCounts[value]) {
              valueCounts[value]++;
            } else {
              valueCounts[value] = 1;
            }
        });

        let total = 0;

        for (let key in valueCounts) {
            if (valueCounts.hasOwnProperty(key)) {
                total += valueCounts[key];
            }
        }

        // valueCounts = JSON.parse(valueCounts)
        getQuestionDetail[i].options.forEach(x => {
            for (const value in valueCounts) {
              if (x.id == Number(value)) {
                // Calculate the unrounded percentage
                // const unroundedPercentage = (valueCounts[value] / getQuestionDetail[i]?.options?.length) * 100;
                const unroundedPercentage = valueCounts[value] * 100 / total;
                
                // Round the percentage to two decimal places
                x.percentage = Math.round(unroundedPercentage);
              }
            }
        });

        getQuestionDetail[i].options.forEach(x => {
            if(!x.percentage) {
                x.percentage = 0
            }
        })
    }

    let _result = { total_question_count: 0, total_available_question_count:0, total_answer_count : 0 };
    _result.questions = allQuestions;
    _result.answers = getQuestionDetail;
    _result.total_question_count = allQuestionsCount + (getQuestionDetail?.length || 0)
    _result.total_available_question_count = allQuestionsCount;
    _result.total_answer_count = getQuestionDetail?.length;
    return _result;  
}

let QuestionsAnswer = async (body,req) => {
    if (helper.undefinedOrNull(body)) {
        return { status : 400, message: "Request body comes empty." }
    }
    if(!req.user.userId) {
        return { status : 400, message: "token is required." }
    }
    if(!body.answer || !body.answer?.length) {
        return { status: 400, message : "Request body comes empty."}
    }
    let throwErr;
    let throwInvalid;
    let throwInvalidOption;
    let questionList = await PollQuestionsModal.findAll({where : {e_status: 'Active'}, raw:true})
    

    for(let i=0; i<body?.answer?.length; i++) {
        
        let isQueExist = questionList.filter(x => x.id == body.answer[i]?.question_id)[0]
        if(!isQueExist) {
            throwInvalid = body.answer[i]?.question_id
        }

        let questionsOptionsList = await PollQuestionsOptionsModal.findAll({
            where :{poll_question_id : body.answer[i]?.question_id},
            raw:true
        })

        let options = questionsOptionsList.map(x => x.id)

        body.answer[i]?.answer_id.forEach(x => {
            if(!options.includes(Number(x))) {
                throwInvalidOption = x
            }
        })

        let ansAlreadyExist = await PollQuestionUserAnswerOptionsModal.findOne({
            where : {i_user_id : req.user.userId, i_poll_question_id: body.answer[i]?.question_id},
            raw: true
        })

        if(ansAlreadyExist) {
            throwErr = ansAlreadyExist.i_poll_question_id
        }

        if(isQueExist.e_type == 'Radio' &&  body.answer[i]?.answer_id.length > 1) {
            return {status: 400, message:"Question with type 'Radio' can not allowed to answer more than one selection, Question id is "+body.answer[i]?.question_id+"."}
        }

        if(throwInvalid) {
            return {status: 400, message:"Question with this id does not exist, Question id is "+throwInvalid+"."}
        }
    
        if(throwInvalidOption) {
            return {status: 400, message:"Selected Option is not associated with any question, Option id is "+throwInvalidOption+"."}
        }
        
        if(throwErr) {
            return {status: 400, message:"You have already answerd this question, Question id is "+throwErr+"."}
        }
    }

    let totalQuestions = await PollQuestionsModal.count({
        where: {e_status: 'Active'},
        order: [['i_order', 'ASC']],
        raw: true
    });

    let isStatisticExist = await PollQuestionUserAnswersModal.findOne({
        where : {i_user_id : req.user.userId},
        raw: true
    })

    let statisticData;
    // Adding / Updating statistics
    if(!isStatisticExist) {
        let user_answer_statistic_data = {
            i_user_id : req.user.userId,
            i_total_question : totalQuestions,
            i_total_answer : body.answer?.length,
            i_total_not_answer : totalQuestions - body.answer?.length
        }
    
        // Save statistic.
        statisticData = await PollQuestionUserAnswersModal.create(user_answer_statistic_data, {raw: true});
        statisticData = statisticData.dataValues.id
    } else {
        let user_answer_statistic_data = {
            i_user_id : req.user.userId,
            i_total_question : totalQuestions,
            i_total_answer : body.answer?.length + isStatisticExist.i_total_answer,
            i_total_not_answer : totalQuestions - (body.answer?.length + isStatisticExist.i_total_answer)
        }
        statisticData = await PollQuestionUserAnswersModal.update(user_answer_statistic_data, { where: {i_user_id: req.user.userId}, raw: true });
    }

    let optionData = []
    for(let i=0; i<body.answer.length; i++) {
        body.answer[i].answer_id = body.answer[i].answer_id.map(x => x = Number(x))
        optionData.push({
            i_poll_question_user_answer_id : statisticData,
            i_user_id : req.user.userId,
            i_poll_question_id : Number(body.answer[i].question_id),
            j_poll_question_option_id : JSON.stringify(body.answer[i].answer_id)
        })
    }

    await PollQuestionUserAnswerOptionsModal.bulkCreate(optionData, { raw: true });


    // Send result
    let userAttemptedQuestions = await PollQuestionUserAnswerOptionsModal.findAll({
        where: {i_user_id : req.user.userId},
        order: [['id', 'ASC']],
        raw: true
    })

    let attemptedIds = userAttemptedQuestions.map(x => x.i_poll_question_id)

    let allQuestions = await PollQuestionsModal.findAll({
        where: {id : {[Sequelize.Op.notIn]: attemptedIds}, e_status: 'Active'},
        order: [['i_order', 'ASC']],
        raw: true
    });

    let allQuestionsCount = await PollQuestionsModal.count({   
        where: {id : {[Sequelize.Op.notIn]: attemptedIds}, e_status: 'Active'},
        order: [['i_order', 'ASC']],
        raw: true
    });

    let options = await PollQuestionsOptionsModal.findAll({raw:true})
    for(let i=0 ; i<allQuestions.length; i++) {
        allQuestions[i].options = options.filter(x => x.poll_question_id == allQuestions[i].id)
    }

    let getQuestionDetail = await PollQuestionsModal.findAll({
        where: {id : attemptedIds, e_status: 'Active'},
        order: [['i_order', 'ASC']],
        raw: true
    });

    let allAttemptedQuestions = await PollQuestionUserAnswerOptionsModal.findAll({
        where: {},
        order: [['id', 'ASC']],
        raw: true
    })

    for(let i=0 ; i<getQuestionDetail.length; i++) {
        getQuestionDetail[i].options = options.filter(x => x.poll_question_id == getQuestionDetail[i].id)
        let totalAnsersGivenByUser = allAttemptedQuestions.filter(x => x.i_poll_question_id == getQuestionDetail[i].id)
        let totalOptionsSelectedByUser = totalAnsersGivenByUser.map(ans => ans.j_poll_question_option_id)

        totalOptionsSelectedByUser = totalOptionsSelectedByUser.map(JSON.parse);
        
        let flattenedData;
        const valueCounts = {};
        if (Array.isArray(totalOptionsSelectedByUser)) {
            flattenedData = totalOptionsSelectedByUser.flat()
        } else {
            flattenedData = totalOptionsSelectedByUser
        }

        // flattenedData = JSON.parse(flattenedData)
        flattenedData = flattenedData.map(JSON.parse);
        

        if (Array.isArray(flattenedData)) {
            flattenedData = flattenedData.flat()
        } else {
            flattenedData = flattenedData
        }
        
        flattenedData?.forEach(value => {
            if (valueCounts[value]) {
              valueCounts[value]++;
            } else {
              valueCounts[value] = 1;
            }
        });

        let total = 0;

        for (let key in valueCounts) {
            if (valueCounts.hasOwnProperty(key)) {
                total += valueCounts[key];
            }
        }
        // valueCounts = JSON.parse(valueCounts)
        getQuestionDetail[i].options.forEach(x => {
            for (const value in valueCounts) {
              if (x.id == Number(value)) {
                // Calculate the unrounded percentage
                // const unroundedPercentage = (valueCounts[value] / getQuestionDetail[i]?.options?.length) * 100;
                const unroundedPercentage = valueCounts[value] * 100 / total;
                
                // Round the percentage to two decimal places
                x.percentage = Math.round(unroundedPercentage);
              }
            }
        });

        getQuestionDetail[i].options.forEach(x => {
            if(!x.percentage) {
                x.percentage = 0
            }
        })
    }

    let _result = { total_question_count: 0, total_available_question_count:0, total_answer_count : 0 };
    _result.questions = allQuestions;
    _result.answers = getQuestionDetail;
    _result.total_question_count = allQuestionsCount + (getQuestionDetail?.length || 0)
    _result.total_available_question_count = allQuestionsCount;
    _result.total_answer_count = getQuestionDetail?.length;
    return _result;
}

module.exports = {
    QuestionsList: QuestionsList,
    QuestionsAnswer: QuestionsAnswer
}