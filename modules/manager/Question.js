"use strict";

let helper = require("../helpers/helpers"),
  _ = require("lodash"),
  md5 = require("md5"),
  config = process.config.global_config,
  QuestionModel = require("../models/Question"),
  QuestionLikeModel = require("../models/QuestionLike"),
  QuestionUnlikeModel = require("../models/QuestionUnlike"),
  QuestionsAnswerModel = require("../models/QuestionsAnswer"),
  QuestionsCommentModel = require("../models/QuestionsComment"),
  QuestionsBookmarkModel = require("../models/QuestionBookmark"),
  BadRequestError = require("../errors/badRequestError");
const { v4: uuidv4 } = require("uuid");
const { use } = require("../routes/Users");
const VocationModal = require("../models/Vocation");

let generateAuthToken = async (phone) => {
  return uuidv4();
};

let CreateQuestion = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("Request body comes empty");
  }
  ['queQuestion','queDescription','queType','queMode','vocationID'].forEach(x => {
      if (!body[x]) {
          throw new BadRequestError(x + " is required");
      }
  });

  let question = await QuestionModel
      .findOne({ where: {queQuestion: body.queQuestion}, raw: true });
  
  if(question) {
      throw new BadRequestError("Question already exists");
  }

  let questionData = {}
  if(body?.queType == 'Question') {
    questionData = {
      queQuestion: body.queQuestion,
      queDescription: body.queDescription,
      queType: body.queType,
      queMode: body.queMode,
      vocationID: body.vocationID
    }
  } else {
    let filename = "";
    try {
        filename = req.file.filename;
    }
    catch (error) {
    }
  
    if (!filename) {
        throw new BadRequestError('Upload Any Image');
    }

    questionData = {
      vocationID: body.vocationID,
      queQuestion: filename,
      queDescription: body.queDescription,
      queType: body.queType,
      queMode: body.queMode,
    }
  }

  let questionDetail = await QuestionModel.create(questionData);

  if(body?.queType == 'Post') {
    questionDetail.queQuestion = config.upload_folder + config.upload_entities.post_image_folder + questionDetail.queQuestion;
  }

  return {slides : questionDetail};
}

let QuestionList = async (body) => {
  let limit = (body.limit) ? parseInt(body.limit) : 10;
  let page = body.page || 1;
  let offset = (page - 1) * limit;
  let findData = {queStatus : 'Active'}
      if (body.filters) {
        if (body.filters.searchtext) {
          findData["$and"] = [
            {queType: {$like: '%' + body.filters.searchtext + '%'}},
            {queDescription: {$like: '%' + body.filters.searchtext + '%'}}
          ]
        }
      }
  if(body.page || body.limit) {
     let allQuestion = await QuestionModel.findAll({
          where: findData,
          limit,
          offset,
          order: [['queID', 'DESC']],
          raw: true
      });

      
      for(let i=0 ; i<allQuestion.length; i++) {
        if(allQuestion[i].queType == 'Post') {
          allQuestion[i].queQuestion = config.upload_folder + config.upload_entities.post_image_folder + allQuestion[i].queQuestion;
        }

        allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalLikeCount = await QuestionLikeModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalDislikeCount = await QuestionUnlikeModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

      }
      let allQuestionCount = await QuestionModel.count({   
          where: findData,     
          order: [['queID', 'DESC']],
          raw: true
      });


      let _result = { total_count: 0 };
      _result.slides = allQuestion;
      _result.total_count = allQuestionCount;
      return _result;
  }   else {
      let allQuestion = await QuestionModel.findAll({
          where: findData,
          order: [['queID', 'DESC']],
          raw: true
      });
      for(let i=0 ; i<allQuestion.length; i++) {
        if(allQuestion[i].queType == 'Post') {
          allQuestion[i].queQuestion = config.upload_folder + config.upload_entities.post_image_folder + allQuestion[i].queQuestion;
        }

        allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalLikeCount = await QuestionLikeModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalDislikeCount = await QuestionUnlikeModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })
        
      }
      let allQuestionCount = await QuestionModel.count({        
          order: [['queID', 'DESC']],
          raw: true
      });
      let _result = { total_count: 0 };
      _result.slides = allQuestion;
      _result.total_count = allQuestionCount;
      return _result;
  } 
  
}

let QuestionLike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("Request body comes empty");
  }
  ['queID','userID'].forEach(x => {
      if (!body[x]) {
          throw new BadRequestError(x + " is required");
      }
  });

  let question = await QuestionModel
      .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });

  let questionUnlike = await QuestionUnlikeModel
      .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });
  
  if(questionUnlike) {
    await QuestionUnlikeModel
    .destroy({ where: {queID : body.queID , userID: body.userID}, raw: true });
  }

  let questionLikeData = {
    queID: body.queID,
    userID: body.userID
  }
  
  await QuestionLikeModel.create(questionLikeData);
  await QuestionModel.update({queLikeCount : Number(question?.queLikeCount) + 1}, {where: { queID: body.queID, userID : body.userID }});


  return {liked : true}; 
  
}

let QuestionUnlike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("Request body comes empty");
  }
  ['queID','userID'].forEach(x => {
      if (!body[x]) {
          throw new BadRequestError(x + " is required");
      }
  });

  let question = await QuestionModel
      .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });

  let questionLike = await QuestionLikeModel
      .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });
  
  if(questionLike) {
    await QuestionLikeModel
    .destroy({ where: {queID : body.queID , userID: body.userID}, raw: true });
  }

  let questionUnlikeData = {
    queID: body.queID,
    userID: body.userID
  }
  
  await QuestionUnlikeModel.create(questionUnlikeData);
  await QuestionModel.update({queDislikeCount : Number(question?.queDislikeCount) + 1}, {where: { queID: body.queID, userID : body.userID }});

  return {unliked : true}; 
  
}

let QuestionsAnswer = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("Request body comes empty");
  }
  ['queID','userID','answerAnswer'].forEach(x => {
      if (!body[x]) {
          throw new BadRequestError(x + " is required");
      }
  });

  let question = await QuestionModel
      .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });
  
  // if(questionLike) {
  //   await QuestionLikeModel
  //   .destroy({ where: {queID : body.queID , userID: body.userID}, raw: true });
  // }

  let questionsAnswerData = {
    queID: body.queID,
    userID: body.userID,
    answerAnswer: body.answerAnswer
  }
  
  let answerData = await QuestionsAnswerModel.create(questionsAnswerData);
  await QuestionModel.update({queAnswerCount : Number(question?.queAnswerCount) + 1}, {where: { queID: body.queID, userID : body.userID }});

  return {slides : answerData}; 
  
}

let MyQuestionList = async (body) => {
  let limit = (body.limit) ? parseInt(body.limit) : 10;
  let page = body.page || 1;
  let offset = (page - 1) * limit;
  let findData = {queStatus : 'Active'}
      if (body.filters) {
        if (body.filters.searchtext) {
          findData["$and"] = [
            {userID: {$like: '%' + body.filters.userID + '%'}}, // Check from frontend userID is passed from filter or at outer side of filter
          ]
        } else {
          findData["$and"] = [
            {userID: {$like: '%' + body.userID + '%'}}, // Check from frontend userID is passed from filter or at outer side of filter
          ]
        }
      }
  if(body.page || body.limit) {
     let allQuestion = await QuestionModel.findAll({
          where: findData,
          limit,
          offset,
          order: [['queID', 'DESC']],
          raw: true
      });
      for(let i=0 ; i<allQuestion.length; i++) {
        if(allQuestion[i].queType == 'Post') {
          allQuestion[i].queQuestion = config.upload_folder + config.upload_entities.post_image_folder + allQuestion[i].queQuestion;
        }

        allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalLikeCount = await QuestionLikeModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalDislikeCount = await QuestionUnlikeModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

      }
      let allQuestionCount = await QuestionModel.count({   
          where: findData,     
          order: [['queID', 'DESC']],
          raw: true
      });
      let _result = { total_count: 0 };
      _result.slides = allQuestion;
      _result.total_count = allQuestionCount;
      return _result;
  }   else {
      let allQuestion = await QuestionModel.findAll({
          where: findData,
          order: [['queID', 'DESC']],
          raw: true
      });
      for(let i=0 ; i<allQuestion.length; i++) {
        if(allQuestion[i].queType == 'Post') {
          allQuestion[i].queQuestion = config.upload_folder + config.upload_entities.post_image_folder + allQuestion[i].queQuestion;
        }
        
        allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalLikeCount = await QuestionLikeModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalDislikeCount = await QuestionUnlikeModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

        allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
          where: {queID : allQuestion[i].queID},
          raw: true
        })

      }
      let allQuestionCount = await QuestionModel.count({        
          order: [['queID', 'DESC']],
          raw: true
      });
      let _result = { total_count: 0 };
      _result.slides = allQuestion;
      _result.total_count = allQuestionCount;
      return _result;
  } 
  
}

let QuestionsComment = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("Request body comes empty");
  }
  ['queID','userID','queComment'].forEach(x => {
      if (!body[x]) {
          throw new BadRequestError(x + " is required");
      }
  });

  // let questionLike = await QuestionLikeModel
  //     .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });
  
  // if(questionLike) {
  //   await QuestionLikeModel
  //   .destroy({ where: {queID : body.queID , userID: body.userID}, raw: true });
  // }

  let questionsCommentData = {
    queID: body.queID,
    userID: body.userID,
    queComment: body.queComment
  }
  
  let commentData = await QuestionsCommentModel.create(questionsCommentData);

  return {slides : commentData}; 
  
}

let QuestionsBookmark = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("Request body comes empty");
  }
  ['queID','userID'].forEach(x => {
      if (!body[x]) {
          throw new BadRequestError(x + " is required");
      }
  });

  let question = await QuestionModel
      .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });

  let questionBookmark = await QuestionsBookmarkModel
      .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });
  
  if(questionBookmark) {
    await QuestionsBookmarkModel
    .destroy({ where: {queID : body.queID , userID: body.userID}, raw: true });
  }

  let questionbookmarkData = {
    queID: body.queID,
    userID: body.userID
  }
  
  await QuestionsBookmarkModel.create(questionbookmarkData);
  await QuestionModel.update({queBookmarkCount : Number(question?.queBookmarkCount) + 1}, {where: { queID: body.queID, userID : body.userID }});

  return {bookmarked : true}; 
  
}

let QuestionsUnBookmark = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("Request body comes empty");
  }
  ['queID','userID'].forEach(x => {
      if (!body[x]) {
          throw new BadRequestError(x + " is required");
      }
  });

  let questionBookmark = await QuestionsBookmarkModel
      .findOne({ where: {queID : body.queID , userID: body.userID}, raw: true });
  
  if(questionBookmark) {
    await QuestionsBookmarkModel
    .destroy({ where: {queID : body.queID , userID: body.userID}, raw: true });

    await QuestionModel.update({queBookmarkCount : Number(question?.queBookmarkCount) - 1}, {where: { queID: body.queID, userID : body.userID }});
  }

  return {unbookmarked : true}; 
  
}

module.exports = {
  CreateQuestion:CreateQuestion,
  QuestionList:QuestionList,
  QuestionLike:QuestionLike,
  QuestionUnlike:QuestionUnlike,
  QuestionsAnswer: QuestionsAnswer,
  MyQuestionList:MyQuestionList,
  QuestionsComment:QuestionsComment,
  QuestionsBookmark:QuestionsBookmark,
  QuestionsUnBookmark:QuestionsUnBookmark
};
