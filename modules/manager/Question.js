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
  QuestionsAnswersReplyModel = require("../models/QuestionsAnswersReply"),
  QuestionsAnswerLikeModel = require("../models/QuestionsAnswerLike"),
  QuestionsAnswerUnlikeModel = require("../models/QuestionsAnswerUnlike"),
  QuestionsCommentLikeModel = require("../models/QuestionsCommentLike"),
  QuestionsCommentUnlikeModel = require("../models/QuestionsCommentUnlike"),
  QuestionImagesModel = require('../models/QuestionImages'),
  BadRequestError = require("../errors/badRequestError");
const { v4: uuidv4 } = require("uuid");
const QuestionsAnswersReplyModal = require("../models/QuestionsAnswersReply");
const UsersModal = require("../models/Users");
const QuestionsAnswerModal = require("../models/QuestionsAnswer");

let generateAuthToken = async (phone) => {
  return uuidv4();
};

let CreateQuestion = async (req) => {

  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queDescription", "queType", "queMode", "vocationID"].forEach(
    (x) => {
      if (!body[x]) {
        throw new BadRequestError(x + " is required");
      }
    }
  );
    
    try {
      let question = await QuestionModel.findOne({
        where: { queQuestion: body.queQuestion },
        raw: true,
      });
    
      if (question) {
        throw new BadRequestError("Question already exists");
      }
    
      let questionData = {};
      if (body?.queType == "Question") {
        questionData = {
          queQuestion: body.queQuestion,
          queDescription: body.queDescription,
          queType: body.queType,
          queMode: body.queMode,
          vocationID: body.vocationID,
          userID: body.userID,
        };
      } else {
        let filename = "";
        try {
          filename = req.file.filename;
        } catch (error) {}
    
        // if (!filename) {
        //   throw new BadRequestError("Upload Any Image");
        // }
    
        questionData = {
          vocationID: body.vocationID,
          queQuestion:'abc',
          queDescription: body.queDescription,
          queType: body.queType,
          queMode: body.queMode,
          userID: body.userID,
        };
      
      }
      let questionDetail = await QuestionModel.create(questionData);
      let createdQue = await QuestionModel.findOne({
        where : {vocationID: body.vocationID,queDescription: body.queDescription, queType: body.queType,userID: body.userID},
        raw: true
      })

      let values = []
      
      if(req.files){
        for(let i=0; i< req.files.length; i++) {
          values.push({
            queID : createdQue.queID,
            userID : body.userID,
            image : req.files[i].filename
          })
        }
        let queImages = await QuestionImagesModel.bulkCreate(values, {returning: true})
      }

    
      // if (body?.queType == "Post") {
      //   questionDetail.queQuestion =
      //     config.upload_folder +
      //     config.upload_entities.post_image_folder +
      //     questionDetail.queQuestion;
      // }
    
      // emit realTimeFeed event to all users
      let realTimeFeed = {
        type: "realTimeFeed",
        data: {
          type: "question",
          data: questionDetail,
        },
      };
      req.io.emit("realTimeFeed", realTimeFeed);
      return { slides: questionDetail };
    } catch (err) {
      console.log(err)
    }
 
};

let QuestionList = async (body) => {
  let limit = body.limit ? parseInt(body.limit) : 10;
  let page = body.page || 1;
  let offset = (page - 1) * limit;
  let findData = { queStatus: "Active", queMode: 'Published' };
  if (body.filters) {
    if (body.filters.searchtext) {
      findData["$and"] = [
        { queType: { $like: "%" + body.filters.searchtext + "%" } },
        { queDescription: { $like: "%" + body.filters.searchtext + "%" } },
      ];
    }
  }
  if (body.page || body.limit) {
    let allQuestion = await QuestionModel.findAll({
      where: findData,
      limit,
      offset,
      order: [["queID", "DESC"]],
      raw: true,
    });

    for (let i = 0; i < allQuestion.length; i++) {
      if (allQuestion[i].queType == "Post") {
        allQuestion[i].queQuestion =
          config.upload_folder +
          config.upload_entities.post_image_folder +
          allQuestion[i].queQuestion;
      }

      if (allQuestion[i].queType == "Post") {
        
        let queImages = await QuestionImagesModel.findAll({
          where : { queID : allQuestion[i].queID }
        })

        let img = []
        for(let i = 0; i < queImages.length; i++ ) {
          img.push(config.upload_folder +
          config.upload_entities.post_image_folder +
          queImages[i].image);
        }
        allQuestion[i].queImages = img;

      }

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });
      
      allQuestion[i].isUnliked = unliked == 1 ? true : false

      allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalLikeCount = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalDislikeCount = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count(
        {
          where: { queID: allQuestion[i].queID },
          raw: true,
        }
      );

      allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      let user = await UsersModal.findOne({
        where: { userID: allQuestion[i].userID },
        attributes : ['userFirstName','userLastName','userProfilePicture'],
        raw: true,
      });

      user.userProfilePicture = config.upload_folder + config.upload_entities.post_image_folder + user.userProfilePicture;
      allQuestion[i].user = user

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for(let i = 0; i < allQuestion[i].comments.length; i++) {
        allQuestion[i].comments[i].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[i].userID },
          attributes : ['userFirstName','userLastName','userProfilePicture'],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount = await QuestionsCommentLikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        })

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount = await QuestionsCommentUnlikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        })

      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for(let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes : ['userFirstName','userLastName','userProfilePicture'],
          raw: true,
        });

        try {
          
          allQuestion[i].answer[j].answersreply = await QuestionsAnswersReplyModal.findOne({
            where: { answerID: allQuestion[i].answer[j]?.answerID },
            raw: true,
          });
  
          for(let k = 0; k < allQuestion[i].answer[j]?.answersreply?.length; j++) {
            allQuestion[i].answer[j].answersreply[k].user = await UsersModal.findOne({
              where: { userID: allQuestion[i].answer[j].answersreply[k]?.userID },
              attributes : ['userFirstName','userLastName','userProfilePicture'],
              raw: true,
            });
          }

        } catch(err) {
          console.log(err)
        }

      }
    }
    let allQuestionCount = await QuestionModel.count({
      where: findData,
      order: [["queID", "DESC"]],
      raw: true,
    });

    let _result = { total_count: 0 };
    _result.slides = allQuestion;
    _result.total_count = allQuestionCount;
    return _result;
  } else {
    let allQuestion = await QuestionModel.findAll({
      where: findData,
      order: [["queID", "DESC"]],
      raw: true,
    });
    for (let i = 0; i < allQuestion.length; i++) {
      if (allQuestion[i].queType == "Post") {
        allQuestion[i].queQuestion =
          config.upload_folder +
          config.upload_entities.post_image_folder +
          allQuestion[i].queQuestion;
      }

      if (allQuestion[i].queType == "Post") {
        
        let queImages = await QuestionImagesModel.findAll({
          where : { queID : allQuestion[i].queID }
        })

        let img = []
        for(let i = 0; i < queImages.length; i++ ) {
          img.push(config.upload_folder +
          config.upload_entities.post_image_folder +
          queImages[i].image);
        }
        allQuestion[i].queImages = img;

      }

      let bookmarked = await QuestionsBookmarkModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isBookMarked = bookmarked == 1 ? true : false

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });
      
      allQuestion[i].isLiked = liked == 1 ? true : false

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });
      
      allQuestion[i].isUnliked = unliked == 1 ? true : false
      
      allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalLikeCount = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalDislikeCount = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count(
        {
          where: { queID: allQuestion[i].queID },
          raw: true,
        }
      );

      allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      let user = await UsersModal.findOne({
        where: { userID: allQuestion[i].userID },
        attributes : ['userFirstName','userLastName','userProfilePicture'],
        raw: true,
      });

      user.userProfilePicture = config.upload_folder + config.upload_entities.post_image_folder + user.userProfilePicture;
      allQuestion[i].user = user

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for(let i = 0; i < allQuestion[i].comments.length; i++) {
        allQuestion[i].comments[i].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[i].userID },
          attributes : ['userFirstName','userLastName','userProfilePicture'],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount = await QuestionsCommentLikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        })

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount = await QuestionsCommentUnlikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        })

      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for(let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes : ['userFirstName','userLastName','userProfilePicture'],
          raw: true,
        });

        try {
          
          allQuestion[i].answer[j].answersreply = await QuestionsAnswersReplyModal.findOne({
            where: { answerID: allQuestion[i].answer[j]?.answerID },
            raw: true,
          });
  
          for(let k = 0; k < allQuestion[i].answer[j]?.answersreply?.length; j++) {
            allQuestion[i].answer[j].answersreply[k].user = await UsersModal.findOne({
              where: { userID: allQuestion[i].answer[j].answersreply[k]?.userID },
              attributes : ['userFirstName','userLastName','userProfilePicture'],
              raw: true,
            });
          }

        } catch(err) {
          console.log(err)
        }

      }
    }
    let allQuestionCount = await QuestionModel.count({
      order: [["queID", "DESC"]],
      raw: true,
    });
    let _result = { total_count: 0 };
    _result.slides = allQuestion;
    _result.total_count = allQuestionCount;
    return _result;
  }
};

let QuestionLike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  let questionUnlike = await QuestionUnlikeModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  if (questionUnlike) {
    await QuestionUnlikeModel.destroy({
      where: { queID: body.queID, userID: body.userID },
      raw: true,
    });
  }

  let questionAlreadyLiked = await QuestionLikeModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  if(questionAlreadyLiked) {
    return { liked: true };
  } else {
    let questionLikeData = {
      queID: body.queID,
      userID: body.userID,
    };
  
    await QuestionLikeModel.create(questionLikeData);
    await QuestionModel.update(
      { queLikeCount: Number(question?.queLikeCount) + 1 },
      { where: { queID: body.queID, userID: body.userID } }
    );
  
    return { liked: true };
  }
};

let QuestionUnlike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  let questionLike = await QuestionLikeModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  if (questionLike) {
    await QuestionLikeModel.destroy({
      where: { queID: body.queID, userID: body.userID },
      raw: true,
    });
  }

  let questionAlreadyUnlike = await QuestionUnlikeModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  if(questionAlreadyUnlike) {
    return { unliked: true };
  } else {
    let questionUnlikeData = {
      queID: body.queID,
      userID: body.userID,
    };
  
    await QuestionUnlikeModel.create(questionUnlikeData);
    await QuestionModel.update(
      { queDislikeCount: Number(question?.queDislikeCount) + 1 },
      { where: { queID: body.queID, userID: body.userID } }
    );
  
    return { unliked: true };
  }
};

let QuestionsAnswer = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID", "answerAnswer"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  // if(questionLike) {
  //   await QuestionLikeModel
  //   .destroy({ where: {queID : body.queID , userID: body.userID}, raw: true });
  // }

  let questionsAnswerData = {
    queID: body.queID,
    userID: body.userID,
    answerAnswer: body.answerAnswer,
  };

  let answerData = await QuestionsAnswerModel.create(questionsAnswerData);
  await QuestionModel.update(
    { queAnswerCount: Number(question?.queAnswerCount) + 1 },
    { where: { queID: body.queID, userID: body.userID } }
  );

  return { slides: answerData };
};

let MyQuestionList = async (body) => {
  let limit = body.limit ? parseInt(body.limit) : 10;
  let page = body.page || 1;
  let offset = (page - 1) * limit;
  let findData = { queStatus: "Active", userID: body.userID };
  
  if (body.filters) {
    if (body.filters.searchtext) {
      findData["$and"] = [
        { userID: { $like: "%" + body.filters.userID + "%" } }, // Check from frontend userID is passed from filter or at outer side of filter
      ];
    } else {
      findData["$and"] = [
        { userID: { $like: "%" + body.userID + "%" } }, // Check from frontend userID is passed from filter or at outer side of filter
      ];
    }
  }

  if (body.page || body.limit) {
    let allQuestion = await QuestionModel.findAll({
      where: findData,
      limit,
      offset,
      order: [["queID", "DESC"]],
      raw: true,
    });
    for (let i = 0; i < allQuestion.length; i++) {
      if (allQuestion[i].queType == "Post") {
        allQuestion[i].queQuestion =
          config.upload_folder +
          config.upload_entities.post_image_folder +
          allQuestion[i].queQuestion;
      }

      if (allQuestion[i].queType == "Post") {
        
        let queImages = await QuestionImagesModel.findAll({
          where : { queID : allQuestion[i].id, userID : allQuestion[i].userID }
        })

        let img = []
        for(let i = 0; i < queImages.length; i++ ) {
          img.push(config.upload_folder +
          config.upload_entities.post_image_folder +
          allQuestion[i].queImages);
        }
        allQuestion[i].queImages = img;

      }
      
      let bookmarked = await QuestionsBookmarkModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isBookMarked = bookmarked == 1 ? true : false

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });
      
      allQuestion[i].isUnliked = unliked == 1 ? true : false
      
      allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalLikeCount = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalDislikeCount = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count(
        {
          where: { queID: allQuestion[i].queID },
          raw: true,
        }
      );

      allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      let user = await UsersModal.findOne({
        where: { userID: allQuestion[i].userID },
        attributes : ['userFirstName','userLastName','userProfilePicture'],
        raw: true,
      });

      user.userProfilePicture = config.upload_folder + config.upload_entities.post_image_folder + user.userProfilePicture;
      allQuestion[i].user = user

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for(let i = 0; i < allQuestion[i].comments.length; i++) {
        allQuestion[i].comments[i].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[i].userID },
          attributes : ['userFirstName','userLastName','userProfilePicture'],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount = await QuestionsCommentLikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        })

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount = await QuestionsCommentUnlikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        })

      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for(let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes : ['userFirstName','userLastName','userProfilePicture'],
          raw: true,
        });

        try {
          
          allQuestion[i].answer[j].answersreply = await QuestionsAnswersReplyModal.findOne({
            where: { answerID: allQuestion[i].answer[j]?.answerID },
            raw: true,
          });
  
          for(let k = 0; k < allQuestion[i].answer[j]?.answersreply?.length; j++) {
            allQuestion[i].answer[j].answersreply[k].user = await UsersModal.findOne({
              where: { userID: allQuestion[i].answer[j].answersreply[k]?.userID },
              attributes : ['userFirstName','userLastName','userProfilePicture'],
              raw: true,
            });
          }

        } catch(err) {
          console.log(err)
        }

      }

    }
    let allQuestionCount = await QuestionModel.count({
      where: findData,
      order: [["queID", "DESC"]],
      raw: true,
    });
    
    let _result = { total_count: 0 };
    _result.slides = allQuestion;
    _result.total_count = allQuestionCount;
    return _result;
  } else {
    let allQuestion = await QuestionModel.findAll({
      where: findData,
      order: [["queID", "DESC"]],
      raw: true,
    });
    for (let i = 0; i < allQuestion.length; i++) {
      if (allQuestion[i].queType == "Post") {
        allQuestion[i].queQuestion =
          config.upload_folder +
          config.upload_entities.post_image_folder +
          allQuestion[i].queQuestion;
      }

      if (allQuestion[i].queType == "Post") {
        
        let queImages = await QuestionImagesModel.findAll({
          where : { queID : allQuestion[i].queID }
        })

        let img = []
        for(let i = 0; i < queImages.length; i++ ) {
          img.push(config.upload_folder +
          config.upload_entities.post_image_folder +
          queImages[i].image);
        }
        allQuestion[i].queImages = img;

      }

      let bookmarked = await QuestionsBookmarkModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isBookMarked = bookmarked == 1 ? true : false

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });
      
      allQuestion[i].isUnliked = unliked == 1 ? true : false

      allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalLikeCount = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalDislikeCount = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count(
        {
          where: { queID: allQuestion[i].queID },
          raw: true,
        }
      );

      allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      let user = await UsersModal.findOne({
        where: { userID: allQuestion[i].userID },
        attributes : ['userFirstName','userLastName','userProfilePicture'],
        raw: true,
      });

      user.userProfilePicture = config.upload_folder + config.upload_entities.post_image_folder + user.userProfilePicture;
      allQuestion[i].user = user;
      
      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for(let j = 0; j < allQuestion[i].comments?.length; j++) {
        allQuestion[i].comments[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[j]?.userID },
          attributes : ['userFirstName','userLastName','userProfilePicture'],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount = await QuestionsCommentLikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        })

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount = await QuestionsCommentUnlikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        })
        
      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for(let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes : ['userFirstName','userLastName','userProfilePicture'],
          raw: true,
        });

        // for(let i=0; i<allQuestion[i].answer[j].user.length; i++) {
        //   allQuestion[i].answer[j].user[i].images = await QuestionImagesModel.findAll({
        //     where : {  }
        //   })
        // }

        try {
          
          allQuestion[i].answer[j].answersreply = await QuestionsAnswersReplyModal.findOne({
            where: { answerID: allQuestion[i].answer[j]?.answerID },
            raw: true,
          });
  
          for(let k = 0; k < allQuestion[i].answer[j]?.answersreply?.length; j++) {
            allQuestion[i].answer[j].answersreply[k].user = await UsersModal.findOne({
              where: { userID: allQuestion[i].answer[j].answersreply[k]?.userID },
              attributes : ['userFirstName','userLastName','userProfilePicture'],
              raw: true,
            });
          }

        } catch(err) {
          console.log(err)
        }

      }
      
    }
    let allQuestionCount = await QuestionModel.count({
      order: [["queID", "DESC"]],
      raw: true,
    });
    
    let _result = { total_count: 0 };
    _result.slides = allQuestion;
    _result.total_count = allQuestionCount;
    return _result;
  }
};

let QuestionsComment = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID", "queComment"].forEach((x) => {
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
    queComment: body.queComment,
  };

  let commentData = await QuestionsCommentModel.create(questionsCommentData);

  return { slides: commentData };
};

let QuestionsBookmark = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  let questionBookmark = await QuestionsBookmarkModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  if (questionBookmark) {
    await QuestionsBookmarkModel.destroy({
      where: { queID: body.queID, userID: body.userID },
      raw: true,
    });
  }

  let questionbookmarkData = {
    queID: body.queID,
    userID: body.userID,
  };

  await QuestionsBookmarkModel.create(questionbookmarkData);
  await QuestionModel.update(
    { queBookmarkCount: Number(question?.queBookmarkCount) + 1 },
    { where: { queID: body.queID, userID: body.userID } }
  );

  return { bookmarked: true };
};

let QuestionsUnBookmark = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  let questionBookmark = await QuestionsBookmarkModel.findOne({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  if (questionBookmark) {
    await QuestionsBookmarkModel.destroy({
      where: { queID: body.queID, userID: body.userID },
      raw: true,
    });

    await QuestionModel.update(
      { queBookmarkCount: Number(question?.queBookmarkCount) - 1 },
      { where: { queID: body.queID, userID: body.userID } }
    );
  }

  return { unbookmarked: true };
};

let QuestionsAnswersReply = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID", "answerID", "replyAnswer"].forEach((x) => {
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

  let questionsAnswerReplyData = {
    queID: body.queID,
    userID: body.userID,
    answerID: body.answerID,
    replyAnswer: body.replyAnswer,
  };

  let ansReplyData = await QuestionsAnswersReplyModel.create(
    questionsAnswerReplyData
  );

  return { slides: ansReplyData };
};

let QuestionsAnswerLike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["answerID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let questionAnswerUnlike = await QuestionsAnswerUnlikeModel.findAll({
    where: { answerID: body.answerID, userID: body.userID },
    raw: true,
  });

  if (questionAnswerUnlike) {
    await QuestionsAnswerUnlikeModel.destroy({
      where: { answerID: body.answerID, userID: body.userID },
      raw: true,
    });
  }

  let questionAnswerAlreadyLike = await QuestionsAnswerLikeModel.findAll({
    where: { answerID: body.answerID, userID: body.userID },
    raw: true,
  });

  if(questionAnswerAlreadyLike) {
    return { answerliked: true };
  } else {
    let questionAnswerLikeData = {
      answerID: body.answerID,
      userID: body.userID,
    };
  
    await QuestionsAnswerLikeModel.create(questionAnswerLikeData);
  
    return { answerliked: true };
  }
};

let QuestionsAnswerUnlike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["answerID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let questionAnswerLike = await QuestionsAnswerLikeModel.findOne({
    where: { answerID: body.answerID, userID: body.userID },
    raw: true,
  });

  if (questionAnswerLike) {
    await QuestionsAnswerLikeModel.destroy({
      where: { answerID: body.answerID, userID: body.userID },
      raw: true,
    });
  }

  let questionAnswerAlreadyUnlike = await QuestionsAnswerUnlikeModel.findOne({
    where: { answerID: body.answerID, userID: body.userID },
    raw: true,
  });

  if(questionAnswerAlreadyUnlike) {
    return { unliked: true };
  } else {
    let questionAnswerUnlikeData = {
      answerID: body.answerID,
      userID: body.userID,
    };
  
    await QuestionsAnswerUnlikeModel.create(questionAnswerUnlikeData);
  
    return { unliked: true };
  }
};

let QuestionsCommentLike = async (req) => {

  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queCommentID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let questionCommentUnlike = await QuestionsCommentUnlikeModel.findAll({
    where: { queCommentID: body.queCommentID, userID: body.userID },
    raw: true,
  });

  if (questionCommentUnlike) {
    await QuestionsCommentUnlikeModel.destroy({
      where: { queCommentID: body.queCommentID, userID: body.userID },
      raw: true,
    });
  }

  let questionCommentAlreadyLike = await QuestionsCommentLikeModel.findAll({
    where: { queCommentID: body.queCommentID, userID: body.userID },
    raw: true,
  });

  if(questionCommentAlreadyLike) {
    return { commentliked: true };
  } else {
    let questionCommentLikeData = {
      queCommentID: body.queCommentID,
      userID: body.userID,
    };
  
    await QuestionsCommentLikeModel.create(questionCommentLikeData);
  
    return { commentliked: true };
  }
};

let QuestionsCommentUnLike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queCommentID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let questionCommentUnlike = await QuestionsCommentLikeModel.findAll({
    where: { queCommentID: body.queCommentID, userID: body.userID },
    raw: true,
  });

  if (questionCommentUnlike) {
    await QuestionsCommentLikeModel.destroy({
      where: { queCommentID: body.queCommentID, userID: body.userID },
      raw: true,
    });
  }

  let questionCommentAlreadyUnlike = await QuestionsCommentUnlikeModel.findAll({
    where: { queCommentID: body.queCommentID, userID: body.userID },
    raw: true,
  });

  if(questionCommentAlreadyUnlike) {
    return { commentunliked: true };
  } else {
    let questionCommentUnlikeData = {
      queCommentID: body.queCommentID,
      userID: body.userID,
    };
  
    await QuestionsCommentUnlikeModel.create(questionCommentUnlikeData);
  
    return { commentunliked: true };
  }
};

let QuestionArchive = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionModel.findAll({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  if(!question) {
    throw new BadRequestError('You can not archive this question')
  }

  await QuestionModel.update({queStatus : 'Archived'},{
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  return { archived : true }
};

let MyArchivedQuestionsList = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionModel.findAll({
    where: { queStatus: 'Archived', userID: body.userID },
    raw: true,
  });

  for(let i = 0; i < question.length; i++) {
    question[i].user = await UsersModal.findOne({
      where: { userID: question[i].userID },
      attributes : ['userFirstName','userLastName','userProfilePicture'],
      raw: true,
    });
  }

  // if(!question) {
  //   throw new BadRequestError('You do not have any archived question')
  // }

  return { slides : question }
};

let QuestionActivate = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionModel.findAll({
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  if(!question) {
    throw new BadRequestError('You can not active this question')
  }

  await QuestionModel.update({queStatus : 'Active'},{
    where: { queID: body.queID, userID: body.userID },
    raw: true,
  });

  return { actived : true }
};


let updateQuestion = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  [
    "queQuestion",
    "queDescription",
    "vocationID",
  ].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });
  let updatedata ={}
  let optionalFiled=["queQuestion","queDescription","vocationID"]
  optionalFiled.forEach(x=>{
      if(body[x]){
        updatedata[x]=body[x]
      }
  })
  await QuestionModel.update(updatedata,{where:{queID:body.queID},raw:true})
};

module.exports = {
  CreateQuestion: CreateQuestion,
  QuestionList: QuestionList,
  QuestionLike: QuestionLike,
  QuestionUnlike: QuestionUnlike,
  QuestionsAnswer: QuestionsAnswer,
  MyQuestionList: MyQuestionList,
  QuestionsComment: QuestionsComment,
  QuestionsBookmark: QuestionsBookmark,
  QuestionsUnBookmark: QuestionsUnBookmark,
  QuestionsAnswersReply: QuestionsAnswersReply,
  QuestionsAnswerLike: QuestionsAnswerLike,
  QuestionsAnswerUnlike: QuestionsAnswerUnlike,
  QuestionsCommentLike: QuestionsCommentLike,
  QuestionsCommentUnLike: QuestionsCommentUnLike,
  QuestionArchive:QuestionArchive,
  MyArchivedQuestionsList:MyArchivedQuestionsList,
  QuestionActivate:QuestionActivate,
  updateQuestion:updateQuestion
};
