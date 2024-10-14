'use strict';


let helper = require("../helpers/helpers"),
    _ = require("lodash"),
    md5 = require('md5'),
    config = process.config.global_config,
    PollQuestionModel = require("../models/Poll_questions"),
    UserModel = require("../models/User"),
    CountryModel = require("../models/Countries"),
    PollQuestionOptionModel = require("../models/Poll_questions_options"),
    PollQuestionUserAnswersModal = require("../models/Poll_question_user_answers"),
    PollQuestionUserAnswerOptionsModal = require("../models/Poll_question_user_answer_options"),
    fs = require("fs"),
    BadRequestError = require('../errors/badRequestError');
    const Sequelize = require('sequelize');
    const { Op } = require('sequelize');

let CreateQuestion = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    if (!body.t_title?.trim('')) {
        throw new BadRequestError("t_title is required");
    }
    if (!body.e_type?.trim('')) {
        throw new BadRequestError("e_type is required");
    }
    if (!body.v_option_name.length) {
        throw new BadRequestError("options are required");
    }
    if (body.v_option_name.length < 2 || body.v_option_name.length > 8) {
        throw new BadRequestError("Minimum 2 and Maximum 8 opions are allowed");
    }

    let que = await PollQuestionModel
        .findOne({ where: {t_title: body.t_title}, raw: true });
    
    if(que) {
        throw new BadRequestError("Question with this title is already exists");
    }
    let poll_que = await PollQuestionModel.findAll({ where: {}, raw: true });

    let max_order = 0
    if(poll_que?.length > 0) {
        max_order = poll_que.reduce((max, obj) => Math.max(max, obj.i_order), -Infinity);
    }
    // let e_status = body.e_status == 1 ? 'Active' : 'Inactive';
    let questionData = {
        t_title: body.t_title,
        e_type : body.e_type,
        i_order : max_order == 0 ? 1 : max_order+1,
    }

    let questionDetail = await PollQuestionModel.create(questionData , { raw: true });

    let optionData = []

    for(let i=0; i<body.v_option_name.length; i++) {
        optionData.push({
            poll_question_id : questionDetail.id,
            v_option_name : body.v_option_name[i]
        })
    }

    await PollQuestionOptionModel.bulkCreate(optionData, { raw: true });

    await PollQuestionUserAnswersModal.update({
        i_total_question: Sequelize.literal('i_total_question + ' + 1),
        i_total_not_answer: Sequelize.literal('i_total_not_answer + ' + 1)
    },
    { 
    where: {},
    raw: true 
    });

    return {question : questionDetail};
}

let QuestionList = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
    if (body.filters) {
        if (body.filters.searchtext) {
                findData["$and"] = [
                    {t_title: {$like: '%' + body.filters.searchtext + '%'}}
                ]
        }
    }
    if(body.filters.e_type) {
        findData['e_type'] = body.filters.e_type
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
            const startDateFormatted = new Date(startDate).toISOString().split('T')[0] + ' 00:00:00';
            const endDateFormatted = new Date(endDate).toISOString().split('T')[0] + ' 23:59:59';
    
            findData['created_at'] = {
                [Op.between]: [startDateFormatted, endDateFormatted]
            };
        }
    }
    let options = await PollQuestionOptionModel.findAll({raw:true})
    let allQuestion = await PollQuestionModel.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true
    });
    let allQuestionCount = await PollQuestionModel.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });
    let userAttempetdQuestion = await PollQuestionUserAnswerOptionsModal.findAll({raw:true})
    for(let i=0; i<allQuestion.length; i++) {
        allQuestion[i].options = options.filter(x => x.poll_question_id == allQuestion[i].id)
        allQuestion[i].votes = userAttempetdQuestion.filter(x => x.i_poll_question_id == allQuestion[i].id)?.length
    }
    let _result = { total_count: 0 };
    _result.question = allQuestion;
    _result.total_count = allQuestionCount;
    return _result;
    
}

let UpdateQuestion = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
        throw new BadRequestError("Request body comes empty");
    }
    if (!body.t_title?.trim('')) {
        throw new BadRequestError("t_title is required");
    }
    if (!body.e_type?.trim('')) {
        throw new BadRequestError("e_type is required");
    }
    if (!body.v_option_name.length) {
        throw new BadRequestError("options are required");
    }
    if (body.v_option_name.length < 2 || body.v_option_name.length > 8) {
        throw new BadRequestError("Minimum 2 and Maximum 8 opions are allowed");
    }

    let question = await PollQuestionModel
        .findOne({ where: {id: req.params.id}, raw: true });
    
    if(!question) {
        throw new BadRequestError("question doesn't exists");
    }

    let updateData = {};
    let optionalFiled = ['t_title', 'e_type', 'e_status'];
    optionalFiled.forEach(x => {
        if (body[x]) {
            updateData[x] = body[x];
        }
    });

    updateData["updated_at"] = Date.now();
    try {
        await PollQuestionModel.update(updateData, { where: { id: req.params.id }, raw: true });
        let questionData = await PollQuestionModel.findOne({where:{id: req.params.id},raw:true});
        if(body.is_option_changed) {
            let optionIDS = await PollQuestionOptionModel.findAll({
                where: {poll_question_id : req.params.id},
                raw: true
            });
            optionIDS = optionIDS.map(x => x.id)
            let optionData = []
    
            for(let i=0; i<body.v_option_name.length; i++) {
                optionData.push({
                    id : optionIDS[i % optionIDS.length], 
                    poll_question_id : req.params.id,
                    v_option_name : body.v_option_name[i]
                })
            }

            const updatePromises = optionData.map((data) =>
            PollQuestionOptionModel.update(
                { poll_question_id: data.poll_question_id, v_option_name: data.v_option_name }, // New data to update
                { where: { id: data.id } }      // Where condition to match records
            )
            );

            // Use Promise.all to execute all update operations
            Promise.all(updatePromises)
            .then((results) => {
                console.log('Bulk update successful');
            })
            .catch((error) => {
                console.error('Error during bulk update:', error);
            });
    
            // await PollQuestionOptionModel.bulkCreate(optionData, { raw: true });
        }

        if(body.e_status) {
            // Get total count from PollQuestionModel
            let total_questions = await PollQuestionModel.count({
                where: {e_status : 'Active'},
                raw: true
            });

            await PollQuestionUserAnswersModal.update({i_total_question : total_questions}, { where: {}, raw: true });

            // Find user jene queId no ans apelo che PollQuestionUserAnswerOptionsModal
            let usersAnsweredPoll = await PollQuestionUserAnswerOptionsModal.findAll({
                where : {i_poll_question_id : req.params.id},
                raw: true
            })

            let usersId = usersAnsweredPoll.filter(x => x.i_poll_question_id == req.params.id)
            usersId = usersId.map(x => x.i_user_id)
            const decrementAmount = 1;
            try {
                // If inactive then do decrement 
                if(body.e_status == 'Inactive') {
                    await PollQuestionUserAnswersModal.update(
                        {
                            i_total_answer: Sequelize.literal('i_total_answer - ' + decrementAmount),
                        },
                        { 
                            where: { i_user_id: usersId },
                            raw: true 
                        }
                    );
    
                    // Next, calculate i_total_not_answer based on the updated values of i_total_answer and i_total_question
                    await PollQuestionUserAnswersModal.update(
                        {
                            i_total_not_answer: Sequelize.literal('i_total_question - i_total_answer')
                        },
                        { 
                            where: {},
                            raw: true 
                        }
                    );
                } else if (body.e_status == 'Active') {

                    // If Active, Then do Increment. 
                    await PollQuestionUserAnswersModal.update(
                        {
                            i_total_answer: Sequelize.literal('i_total_answer + ' + decrementAmount),
                        },
                        { 
                            where: { i_user_id: usersId },
                            raw: true 
                        }
                    );
    
                    // Next, calculate i_total_not_answer based on the updated values of i_total_answer and i_total_question
                    await PollQuestionUserAnswersModal.update(
                        {
                            i_total_not_answer: Sequelize.literal('i_total_question - i_total_answer')
                        },
                        { 
                            where: {},
                            raw: true 
                        }
                    );
                }
            } catch(err) {
                console.log(err)
            }
        }

        return {question : questionData}
    } catch(err) {
        console.log(err)
        if(err?.parent?.code == 'ER_DUP_ENTRY') {
            throw new BadRequestError("Record with this name is already exist")
        }
    }
}

let QuestionDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("questionID is required");
    }
    let getQuestionDetail = await PollQuestionModel.findOne({
        where: {id : req.params.id},
        raw: true
    });

    let options = await PollQuestionOptionModel.findAll({
        where: {poll_question_id : req.params.id},
        raw: true
    })

    let allAttemptedQuestions = await PollQuestionUserAnswerOptionsModal.findAll({
        where: {},
        order: [['id', 'ASC']],
        raw: true
    })

    getQuestionDetail.options = options
    let totalAnsersGivenByUser = allAttemptedQuestions.filter(x => x.i_poll_question_id == getQuestionDetail.id)
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
    getQuestionDetail.options.forEach(x => {
        for (const value in valueCounts) {
            if(x.id == Number(value)) {
                // Calculate the unrounded percentage
                // const unroundedPercentage = (valueCounts[value] / getQuestionDetail?.options?.length) * 100;
                const unroundedPercentage = valueCounts[value] * 100 / total;
                
                // Round the percentage to two decimal places
                x.percentage = Math.round(unroundedPercentage);
            }
        }
    })

    getQuestionDetail.options.forEach(x => {
        if(!x.percentage) {
            x.percentage = 0
        }
    })
    
    return {question : getQuestionDetail};
}

let DeleteQuestion = async (req) => {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if(!body.selected_ids?.length) {
        throw new BadRequestError("questionID is required");
    }
    
    await PollQuestionModel.destroy({
        where: {id : body.selected_ids},
        raw: true
    });

    await PollQuestionOptionModel.destroy({
        where: {poll_question_id : body.selected_ids},
        raw: true
    });

    
    // Get total count from PollQuestionModel
    let total_questions = await PollQuestionModel.count({
        where: {e_status : 'Active'},
        raw: true
    });

    await PollQuestionUserAnswersModal.update({i_total_question : total_questions}, { where: {}, raw: true });

    // Find user jene queId no ans apelo che PollQuestionUserAnswerOptionsModal
    let usersAnsweredPoll = await PollQuestionUserAnswerOptionsModal.findAll({
        where : {i_poll_question_id : body.selected_ids},
        raw: true
    })

    for(let i=0; i<body.selected_ids?.length; i++) {
        let usersId = usersAnsweredPoll.filter(x => x.i_poll_question_id == body.selected_ids[i])
        usersId = usersId.map(x => x.i_user_id)
        const decrementAmount = 1;
        try {
            await PollQuestionUserAnswersModal.update(
                {
                    i_total_answer: Sequelize.literal('i_total_answer - ' + decrementAmount),
                },
                { 
                    where: { i_user_id: usersId },
                    raw: true 
                }
            );
        
            // Next, calculate i_total_not_answer based on the updated values of i_total_answer and i_total_question
            await PollQuestionUserAnswersModal.update(
                {
                    i_total_not_answer: Sequelize.literal('i_total_question - i_total_answer')
                },
                { 
                    where: {},
                    raw: true 
                }
            );
        } catch(err) {
            console.log(err)
        }
    }

    // Decress count total answered

    await PollQuestionUserAnswerOptionsModal.destroy({
        where: {i_poll_question_id : body.selected_ids},
        raw: true
    });
    
    
    return {message : 'Question deleted successfully'};
}

let SurveyResult = async (body) => {
    let limit = (body.limit) ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = {}
    let userFindData = {}
    if (body.filters) {
        if (body.filters.searchtext) {
                // findData["$and"] = [
                //     {t_title: {$like: '%' + body.filters.searchtext + '%'}}
                // ]

                userFindData["$or"] =[
                    {v_full_name: {$like: '%' + body.filters.searchtext + '%'}},
                    {v_email: {$like: '%' + body.filters.searchtext + '%'}},
                    {v_mobile_number: {$like: '%' + body.filters.searchtext + '%'}}
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

    let user = await UserModel.findAll({where: userFindData, raw:true})

    user.ids = user.map(u => u.id)

    if(user?.ids?.length > 0) {
        findData['i_user_id'] = user.ids
    }

    let country = await CountryModel.findAll({raw:true})
    let surveyList = await PollQuestionUserAnswersModal.findAll({
        where: findData,
        limit,
        offset,
        order: [['id', 'DESC']],
        raw: true
    });
    let surveyListCount = await PollQuestionUserAnswersModal.count({   
        where: findData,     
        order: [['id', 'DESC']],
        raw: true
    });
    for(let i=0; i<surveyList.length; i++) {
        surveyList[i].user = user.filter(x => x.id == surveyList[i]?.i_user_id)[0]
        if(surveyList[i].user) {
            surveyList[i].user.country = country?.filter(x => x.id == surveyList[i]?.user?.i_country_id)[0]
        }
    }
    surveyList = surveyList.filter(user => user?.user?.id)

    let _result = { total_count: 0 };
    _result.survey_result = surveyList;
    _result.total_count = surveyListCount;
    return _result;
}

let SurveyResultDetail = async (req) => {
    if(!req.params.id) {
        throw new BadRequestError("Survey Detail Id is required");
    }

    let AnswerData = await PollQuestionUserAnswersModal.findOne({
        where: {id : req.params.id},
        raw: true
    });

    // let userId = AnswerData.map(x => x.i_user_id)
    let user = await UserModel.findOne({where: {id : AnswerData?.i_user_id},
        raw: true})

    let country = await CountryModel.findOne({where: {id : user?.i_country_id},
        raw: true})

    user.country = country ? country : null;

    let questionOptionAnswerData = await PollQuestionUserAnswerOptionsModal.findAll({
        where: {i_user_id : AnswerData.i_user_id},
        raw: true
    });

    let queIds = questionOptionAnswerData.map(x => x.i_poll_question_id)
    
    let questionData = await PollQuestionModel.findAll({
        where: {id : queIds},
        raw: true
    });

    let options = await PollQuestionOptionModel.findAll({raw:true})
    for(let i=0 ; i<questionData.length; i++) {
        questionData[i].options = options.filter(x => x.poll_question_id == questionData[i].id)
       
        let que = questionOptionAnswerData.filter(x => x.i_poll_question_id == questionData[i].id)[0]

        
        que.j_poll_question_option_id = JSON.parse(que.j_poll_question_option_id)
        que.j_poll_question_option_id = JSON.parse(que.j_poll_question_option_id)
        
        questionData[i].options.forEach(x => {
            if(que.j_poll_question_option_id.includes(x.id)) {
                x.is_user_selected = true
            } else {
                x.is_user_selected = false
            }
        })
    }


    
    return {user : user,question : questionData};
}

let PollUserList = async (body) => {
    
    let allUser = await PollQuestionUserAnswersModal.findAll({
        where: {},
        order: [['id', 'DESC']],
        raw: true
    });

    allUser = allUser.map(x => x.i_user_id)

    let pollUser = await UserModel.findAll({
        where: {id : allUser},
        raw: true
    });
    
    let country = await CountryModel.findAll({
        where: {},
        raw: true
    });

    for(let i=0;i<pollUser?.length; i++) {
        pollUser[i].country = country.filter(x => x.id == pollUser[i]?.i_country_id)[0]
    }

    let _result = { };
    _result.user = pollUser;
    return _result;
    
}

module.exports = {
    CreateQuestion:CreateQuestion,
    QuestionList: QuestionList,
    UpdateQuestion: UpdateQuestion,
    QuestionDetail: QuestionDetail,
    DeleteQuestion: DeleteQuestion,
    SurveyResult: SurveyResult,
    SurveyResultDetail: SurveyResultDetail,
    PollUserList: PollUserList
}