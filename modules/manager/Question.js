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
  QuestionImagesModel = require("../models/QuestionImages"),
  AnswerReplyLikeModel = require("../models/AnswerReplyLike"),
  AnswerReplyUnlikeModel = require("../models/AnswerReplyUnlike"),
  BadRequestError = require("../errors/badRequestError");
const { v4: uuidv4 } = require("uuid");
const QuestionsAnswersReplyModal = require("../models/QuestionsAnswersReply");
const UsersModal = require("../models/Users");
const QuestionsAnswerModal = require("../models/QuestionsAnswer");
const sequelize_mysql = require("../helpers/sequelize-mysql");
const sequelize = require("sequelize");
const { voilatedKeywords } = require("../helpers/voilatedKeywords");
const UservocationModel = require("../models/User_vocations");
const UserSubVocationModel = require("../models/User_subvocations");
const userFollowModal = require("../models/UserFollowID");
const ReportModal = require("../models/Report");

let generateAuthToken = async (phone) => {
  return uuidv4();
};

let CreateQuestion = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  ["queQuestion", "queDescription", "queType", "queMode", "vocationID"].forEach(
    (x) => {
      if (!body[x]) {
        throw new BadRequestError(x + " is required");
      }
    }
  );

  let question = await QuestionModel.findOne({
    where: { queQuestion: body.queQuestion ? body.queQuestion : "" },
    raw: true,
  });

  if (question) {
    throw new BadRequestError(`${body.queType} already exists`);
  }

  let questionData = {};
  if (body?.queType == "Question") {
    let queStatus = "Active";
    if (
      voilatedKeywords.some((x) => body.queQuestion.toLowerCase().includes(x))
    ) {
      queStatus = "Voilated";
    }
    questionData = {
      queQuestion: body.queQuestion,
      queDescription: body.queDescription,
      queType: body.queType,
      queMode: body.queMode,
      vocationID: body.vocationID,
      userID: body.userID,
      queStatus: queStatus,
    };
  } else {
    let filename = "";
    try {
      filename = req.file.filename;
    } catch (error) {}

    questionData = {
      vocationID: body.vocationID,
      queQuestion: body.queQuestion,
      queDescription: body.queDescription,
      queType: body.queType,
      queMode: body.queMode,
      userID: body.userID,
    };
  }
  let questionDetail = await QuestionModel.create(questionData);
  let createdQue = await QuestionModel.findOne({
    where: {
      vocationID: body.vocationID,
      queDescription: body.queDescription,
      queType: body.queType,
      userID: body.userID,
    },
    raw: true,
  });

  let values = [];

  if (req.files) {
    for (let i = 0; i < req.files.length; i++) {
      values.push({
        queID: createdQue.queID,
        userID: body.userID,
        image: req.files[i].filename,
      });
    }
    let queImages = await QuestionImagesModel.bulkCreate(values, {
      returning: true,
    });
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
};

let QuestionList = async (body) => {
  try {
    let limit = body.limit ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = { queStatus: "Active", queMode: "Published" };
    if (body.filters) {
      if (body.filters.searchtext) {
        findData["$and"] = [
          { queType: { $like: "%" + body.filters.searchtext + "%" } },
          { queDescription: { $like: "%" + body.filters.searchtext + "%" } },
        ];
      }
    }
    if (body.page || body.limit) {
      let allQuestionList = await QuestionModel.findAll({
        where: findData,
        limit,
        offset,
        order: [["queID", "DESC"]],
        raw: true,
      });

      let allQuestion = [];
      for (let i = 0; i < allQuestionList.length; i++) {
        if (allQuestionList[i].vocType == "vocation") {
          let userFollowedVocation = await UservocationModel.findAll({
            where: {
              vocationID: allQuestionList[i].vocationID,
              userID: body.userID,
              uservocationStatus: "Following",
            },
            raw: true,
          });
          if (userFollowedVocation.length) {
            allQuestion.push(allQuestionList[i]);
          }
        }

        if (allQuestionList[i].vocType == "subvocation") {
          let userFollowedSubVocation = await UserSubVocationModel.findAll({
            where: {
              subvocationID: allQuestionList[i].vocationID,
              userID: body.userID,
              usersubvocationStatus: "Following",
            },
            raw: true,
          });
          if (userFollowedSubVocation.length) {
            allQuestion.push(allQuestionList[i]);
          }
        }
      }

      for (let i = 0; i < allQuestion.length; i++) {
        if (allQuestion[i].queType == "Post") {
          let queImages = await QuestionImagesModel.findAll({
            where: { queID: allQuestion[i].queID },
          });

          let img = [];
          for (let i = 0; i < queImages.length; i++) {
            img.push(
              config.upload_folder +
                config.upload_entities.post_image_folder +
                queImages[i].image
            );
          }
          allQuestion[i].queImages = img;
        }

        let liked = await QuestionLikeModel.count({
          where: { queID: allQuestion[i].queID, userID: body.userID },
          raw: true,
        });

        allQuestion[i].isLiked = liked == 1 ? true : false;

        let unliked = await QuestionUnlikeModel.count({
          where: { queID: allQuestion[i].queID, userID: body.userID },
          raw: true,
        });

        allQuestion[i].isUnliked = unliked == 1 ? true : false;

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

        allQuestion[i].queTotalBookmarkCount =
          await QuestionsBookmarkModel.count({
            where: { queID: allQuestion[i].queID },
            raw: true,
          });

        allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count(
          {
            where: { queID: allQuestion[i].queID },
            raw: true,
          }
        );

        let user = await UsersModal.findOne({
          where: { userID: allQuestion[i].userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        user.userProfilePicture = user?.userProfilePicture
          ? config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            user.userProfilePicture
          : config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            "profile_bg.png";

        allQuestion[i].user = user;

        allQuestion[i].comments = await QuestionsCommentModel.findAll({
          where: { queID: allQuestion[i].queID },
          raw: true,
        });

        for (let i = 0; i < allQuestion[i].comments.length; i++) {
          allQuestion[i].comments[i].user = await UsersModal.findOne({
            where: { userID: allQuestion[i].comments[i].userID },
            attributes: ["userFirstName", "userLastName", "userProfilePicture"],
            raw: true,
          });

          // Comment Like count will be done here
          allQuestion[i].comments[j].commentsLikeCount =
            await QuestionsCommentLikeModel.count({
              where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
              raw: true,
            });

          // Comment Dislikes count will be done here
          allQuestion[i].comments[j].commentsUnlikeCount =
            await QuestionsCommentUnlikeModel.count({
              where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
              raw: true,
            });
        }

        allQuestion[i].answer = await QuestionsAnswerModal.findAll({
          where: { queID: allQuestion[i].queID },
          raw: true,
        });

        for (let j = 0; j < allQuestion[i].answer?.length; j++) {
          allQuestion[i].answer[j].user = await UsersModal.findOne({
            where: { userID: allQuestion[i].answer[j]?.userID },
            attributes: ["userFirstName", "userLastName", "userProfilePicture"],
            raw: true,
          });

          try {
            allQuestion[i].answer[j].answersreply =
              await QuestionsAnswersReplyModal.findAll({
                where: { answerID: allQuestion[i].answer[j]?.answerID },
                raw: true,
              });

            for (
              let k = 0;
              k < allQuestion[i].answer[j]?.answersreply?.length;
              j++
            ) {
              allQuestion[i].answer[j].answersreply[k].user =
                await UsersModal.findOne({
                  where: {
                    userID: allQuestion[i].answer[j].answersreply[k]?.userID,
                  },
                  attributes: [
                    "userFirstName",
                    "userLastName",
                    "userProfilePicture",
                  ],
                  raw: true,
                });
            }
          } catch (err) {
            console.log(err);
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
      let allQuestionList = await QuestionModel.findAll({
        where: findData,
        order: [["queID", "DESC"]],
        raw: true,
      });

      let allQuestion = [];
      for (let i = 0; i < allQuestionList.length; i++) {
        if (allQuestionList[i].vocType == "vocation") {
          let userFollowedVocation = await UservocationModel.findAll({
            where: {
              vocationID: allQuestionList[i].vocationID,
              userID: body.userID,
              uservocationStatus: "Following",
            },
            raw: true,
          });
          if (userFollowedVocation.length) {
            allQuestion.push(allQuestionList[i]);
          }
        }

        if (allQuestionList[i].vocType == "subvocation") {
          let userFollowedSubVocation = await UserSubVocationModel.findAll({
            where: {
              subvocationID: allQuestionList[i].vocationID,
              userID: body.userID,
              usersubvocationStatus: "Following",
            },
            raw: true,
          });
          if (userFollowedSubVocation.length) {
            allQuestion.push(allQuestionList[i]);
          }
        }
      }

      for (let i = 0; i < allQuestion.length; i++) {
        if (allQuestion[i].queType == "Post") {
          let queImages = await QuestionImagesModel.findAll({
            where: { queID: allQuestion[i].queID },
          });

          let img = [];
          for (let i = 0; i < queImages.length; i++) {
            img.push(
              config.upload_folder +
                config.upload_entities.post_image_folder +
                queImages[i].image
            );
          }
          allQuestion[i].queImages = img;
        }

        let bookmarked = await QuestionsBookmarkModel.count({
          where: { queID: allQuestion[i].queID, userID: body.userID },
          raw: true,
        });

        allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

        let liked = await QuestionLikeModel.count({
          where: { queID: allQuestion[i].queID, userID: body.userID },
          raw: true,
        });

        allQuestion[i].isLiked = liked == 1 ? true : false;

        let unliked = await QuestionUnlikeModel.count({
          where: { queID: allQuestion[i].queID, userID: body.userID },
          raw: true,
        });

        allQuestion[i].isUnliked = unliked == 1 ? true : false;

        allQuestion[i].queTotalAnswerCount = await QuestionsAnswerModel.count({
          where: { queID: allQuestion[i].queID, answerStatus: "Active" },
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

        allQuestion[i].queTotalBookmarkCount =
          await QuestionsBookmarkModel.count({
            where: { queID: allQuestion[i].queID },
            raw: true,
          });

        allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count(
          {
            where: { queID: allQuestion[i].queID },
            raw: true,
          }
        );

        let user = await UsersModal.findOne({
          where: { userID: allQuestion[i].userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        user.userProfilePicture = user?.userProfilePicture
          ? config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            user.userProfilePicture
          : config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            "profile_bg.png";
        allQuestion[i].user = user;

        let isFollowed = await userFollowModal.findOne({
          where: {
            userfollowUserID: allQuestion[i].userID,
            userID: body.userID,
          },
          raw: true,
        });

        if (isFollowed) {
          allQuestion[i].isFollow = true;
        }
        if (!isFollowed) {
          allQuestion[i].isFollow = false;
        }

        allQuestion[i].comments = await QuestionsCommentModel.findAll({
          where: { queID: allQuestion[i].queID },
          raw: true,
        });

        for (let i = 0; i < allQuestion[i].comments.length; i++) {
          allQuestion[i].comments[i].user = await UsersModal.findOne({
            where: { userID: allQuestion[i].comments[i].userID },
            attributes: ["userFirstName", "userLastName", "userProfilePicture"],
            raw: true,
          });

          // Comment Like count will be done here
          allQuestion[i].comments[j].commentsLikeCount =
            await QuestionsCommentLikeModel.count({
              where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
              raw: true,
            });

          // Comment Dislikes count will be done here
          allQuestion[i].comments[j].commentsUnlikeCount =
            await QuestionsCommentUnlikeModel.count({
              where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
              raw: true,
            });
        }

        allQuestion[i].answer = await QuestionsAnswerModal.findAll({
          where: { queID: allQuestion[i].queID, answerStatus: "Active" },
          raw: true,
        });

        for (let j = 0; j < allQuestion[i].answer?.length; j++) {
          let liked = await QuestionsAnswerLikeModel.count({
            where: {
              answerID: allQuestion[i].answer[j]?.answerID,
              userID: body.userID,
            },
            raw: true,
          });

          allQuestion[i].answer[j].isLiked = liked == 1 ? true : false;

          let unliked = await QuestionsAnswerUnlikeModel.count({
            where: {
              answerID: allQuestion[i].answer[j]?.answerID,
              userID: body.userID,
            },
            raw: true,
          });

          allQuestion[i].answer[j].isUnliked = unliked == 1 ? true : false;

          if (allQuestion[i].answer.length) {
            // Comment Like count will be done here
            allQuestion[i].answer[j].totalAnswerLikeCount =
              await QuestionsAnswerLikeModel.count({
                where: { answerID: allQuestion[i].answer[j]?.answerID },
                raw: true,
              });

            // Comment Dislikes count will be done here
            allQuestion[i].answer[j].totalAnswerUnlikeCount =
              await QuestionsAnswerUnlikeModel.count({
                where: { answerID: allQuestion[i].answer[j]?.answerID },
                raw: true,
              });
          }

          let user = await UsersModal.findOne({
            where: { userID: allQuestion[i].answer[j]?.userID },
            attributes: ["userFirstName", "userLastName", "userProfilePicture"],
            raw: true,
          });
          user.userProfilePicture = user.userProfilePicture
            ? config.upload_folder +
              config.upload_entities.user_profile_image_folder +
              user.userProfilePicture
            : config.upload_folder +
              config.upload_entities.user_profile_image_folder +
              "profile_bg.png";
          allQuestion[i].answer[j].user = user;

          let isFollowed = await userFollowModal.findOne({
            where: {
              userfollowUserID: allQuestion[i].answer[j].userID,
              userID: body.userID,
            },
            raw: true,
          });

          if (isFollowed) {
            allQuestion[i].answer[j].isFollow = true;
          }
          if (!isFollowed) {
            allQuestion[i].answer[j].isFollow = false;
          }

          try {
            allQuestion[i].answer[j].answersreply =
              await QuestionsAnswersReplyModal.findAll({
                where: { answerID: allQuestion[i].answer[j]?.answerID },
                raw: true,
              });

            for (
              let k = 0;
              k < allQuestion[i].answer[j]?.answersreply?.length;
              k++
            ) {
              let user = await UsersModal.findOne({
                where: {
                  userID: allQuestion[i].answer[j].answersreply[k]?.userID,
                },
                attributes: [
                  "userFirstName",
                  "userLastName",
                  "userProfilePicture",
                ],
                raw: true,
              });

              user.userProfilePicture = user.userProfilePicture
                ? config.upload_folder +
                  config.upload_entities.user_profile_image_folder +
                  user.userProfilePicture
                : config.upload_folder +
                  config.upload_entities.user_profile_image_folder +
                  "profile_bg.png";

              allQuestion[i].answer[j].answersreply[k].user = user;

              let isFollowed = await userFollowModal.findOne({
                where: {
                  userfollowUserID:
                    allQuestion[i].answer[j].answersreply[k].userID,
                  userID: body.userID,
                },
                raw: true,
              });

              if (isFollowed) {
                allQuestion[i].answer[j].answersreply[k].isFollow = true;
              }
              if (!isFollowed) {
                allQuestion[i].answer[j].answersreply[k].isFollow = false;
              }
              allQuestion[i].answer[j].answersreply[k].userID == body.userID
                ? (allQuestion[i].answer[j].isAlreadyRepliedAnswer = true)
                : (allQuestion[i].answer[j].isAlreadyRepliedAnswer = false);

              let liked = await AnswerReplyLikeModel.count({
                where: {
                  replyID: allQuestion[i].answer[j]?.answersreply[k]?.replyID,
                  userID: body.userID,
                },
                raw: true,
              });

              allQuestion[i].answer[j].answersreply[k].isLiked =
                liked == 1 ? true : false;

              let unliked = await AnswerReplyUnlikeModel.count({
                where: {
                  replyID: allQuestion[i].answer[j]?.answersreply[k]?.replyID,
                  userID: body.userID,
                },
                raw: true,
              });

              allQuestion[i].answer[j].answersreply[k].isUnliked =
                unliked == 1 ? true : false;

              // Answer reply like count
              allQuestion[i].answer[j].answersreply[k].totalAnswerLikeCount =
                await AnswerReplyLikeModel.count({
                  where: {
                    replyID: allQuestion[i].answer[j]?.answersreply[k]?.replyID,
                  },
                  raw: true,
                });

              // Comment Dislikes count will be done here
              allQuestion[i].answer[j].answersreply[k].totalAnswerUnlikeCount =
                await AnswerReplyUnlikeModel.count({
                  where: {
                    replyID: allQuestion[i].answer[j]?.answersreply[k]?.replyID,
                  },
                  raw: true,
                });

              // allQuestion[i].answer[j].answersreply[k].totalAnswerLikeCount = allQuestion[i].answer[j].answersreply[k].totalAnswerLikeCount ? allQuestion[i].answer[j].answersreply[k].totalAnswerLikeCount : 0;

              // allQuestion[i].answer[j].answersreply[k].totalAnswerUnlikeCount = allQuestion[i].answer[j].answersreply[k].totalAnswerUnlikeCount ? allQuestion[i].answer[j].answersreply[k].totalAnswerUnlikeCount : 0;
            }
            allQuestion[i].answer[j].answersreply
              .map((x) => x.userID)
              .includes(body.userID)
              ? (allQuestion[i].answer[j].isAlreadyRepliedAnswer = true)
              : (allQuestion[i].answer[j].isAlreadyRepliedAnswer = false);
          } catch (err) {
            console.log(err);
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
  } catch (err) {
    console.log(err);
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

  if (questionAlreadyLiked) {
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

  if (questionAlreadyUnlike) {
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
  let findData = {
    queStatus: "Active",
    userID: body.userID,
    queType: "Question",
    queMode: "Published",
  };

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
        let queImages = await QuestionImagesModel.findAll({
          where: { queID: allQuestion[i].id, userID: allQuestion[i].userID },
        });

        let img = [];
        for (let i = 0; i < queImages.length; i++) {
          img.push(
            config.upload_folder +
              config.upload_entities.post_image_folder +
              allQuestion[i].queImages
          );
        }
        allQuestion[i].queImages = img;
      }

      let bookmarked = await QuestionsBookmarkModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false;

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isUnliked = unliked == 1 ? true : false;

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
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      user.userProfilePicture = user.userProfilePicture
        ? config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          user.userProfilePicture
        : config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          "profile_bg.png";
      allQuestion[i].user = user;

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let i = 0; i < allQuestion[i].comments.length; i++) {
        allQuestion[i].comments[i].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[i].userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount =
          await QuestionsCommentLikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount =
          await QuestionsCommentUnlikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });
      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        try {
          allQuestion[i].answer[j].answersreply =
            await QuestionsAnswersReplyModal.findOne({
              where: { answerID: allQuestion[i].answer[j]?.answerID },
              raw: true,
            });

          for (
            let k = 0;
            k < allQuestion[i].answer[j]?.answersreply?.length;
            j++
          ) {
            allQuestion[i].answer[j].answersreply[k].user =
              await UsersModal.findOne({
                where: {
                  userID: allQuestion[i].answer[j].answersreply[k]?.userID,
                },
                attributes: [
                  "userFirstName",
                  "userLastName",
                  "userProfilePicture",
                ],
                raw: true,
              });
          }
        } catch (err) {
          console.log(err);
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
        let queImages = await QuestionImagesModel.findAll({
          where: { queID: allQuestion[i].queID },
        });

        let img = [];
        for (let i = 0; i < queImages.length; i++) {
          img.push(
            config.upload_folder +
              config.upload_entities.post_image_folder +
              queImages[i].image
          );
        }
        allQuestion[i].queImages = img;
      }

      let bookmarked = await QuestionsBookmarkModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false;

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isUnliked = unliked == 1 ? true : false;

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
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      user.userProfilePicture = user?.userProfilePicture
        ? config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          user.userProfilePicture
        : config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          "profile_bg.png";
      allQuestion[i].user = user;

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].comments?.length; j++) {
        allQuestion[i].comments[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount =
          await QuestionsCommentLikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount =
          await QuestionsCommentUnlikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });
      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        // for(let i=0; i<allQuestion[i].answer[j].user.length; i++) {
        //   allQuestion[i].answer[j].user[i].images = await QuestionImagesModel.findAll({
        //     where : {  }
        //   })
        // }

        try {
          allQuestion[i].answer[j].answersreply =
            await QuestionsAnswersReplyModal.findOne({
              where: { answerID: allQuestion[i].answer[j]?.answerID },
              raw: true,
            });

          for (
            let k = 0;
            k < allQuestion[i].answer[j]?.answersreply?.length;
            j++
          ) {
            allQuestion[i].answer[j].answersreply[k].user =
              await UsersModal.findOne({
                where: {
                  userID: allQuestion[i].answer[j].answersreply[k]?.userID,
                },
                attributes: [
                  "userFirstName",
                  "userLastName",
                  "userProfilePicture",
                ],
                raw: true,
              });
          }
        } catch (err) {
          console.log(err);
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
  }
};

let MyPostList = async ({ body }) => {
  let findData = {
    queStatus: "Active",
    userID: body.userID,
    queType: "Post",
    queMode: "Published",
  };

  let allQuestion = await QuestionModel.findAll({
    where: findData,
    order: [["queID", "DESC"]],
    raw: true,
  });

  for (let i = 0; i < allQuestion.length; i++) {
    if (allQuestion[i].queType == "Post") {
      let queImages = await QuestionImagesModel.findAll({
        where: { queID: allQuestion[i].queID },
      });

      let img = [];
      for (let i = 0; i < queImages.length; i++) {
        img.push(
          config.upload_folder +
            config.upload_entities.post_image_folder +
            queImages[i].image
        );
      }
      allQuestion[i].queImages = img;
    }

    let bookmarked = await QuestionsBookmarkModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

    let liked = await QuestionLikeModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isLiked = liked == 1 ? true : false;

    let unliked = await QuestionUnlikeModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isUnliked = unliked == 1 ? true : false;

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

    allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    let user = await UsersModal.findOne({
      where: { userID: allQuestion[i].userID },
      attributes: ["userFirstName", "userLastName", "userProfilePicture"],
      raw: true,
    });

    user.userProfilePicture = user?.userProfilePicture
      ? config.upload_folder +
        config.upload_entities.user_profile_image_folder +
        user.userProfilePicture
      : config.upload_folder +
        config.upload_entities.user_profile_image_folder +
        "profile_bg.png";
    allQuestion[i].user = user;

    allQuestion[i].comments = await QuestionsCommentModel.findAll({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    for (let j = 0; j < allQuestion[i].comments?.length; j++) {
      allQuestion[i].comments[j].user = await UsersModal.findOne({
        where: { userID: allQuestion[i].comments[j]?.userID },
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      // Comment Like count will be done here
      allQuestion[i].comments[j].commentsLikeCount =
        await QuestionsCommentLikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        });

      // Comment Dislikes count will be done here
      allQuestion[i].comments[j].commentsUnlikeCount =
        await QuestionsCommentUnlikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        });
    }

    allQuestion[i].answer = await QuestionsAnswerModal.findAll({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    for (let j = 0; j < allQuestion[i].answer?.length; j++) {
      allQuestion[i].answer[j].user = await UsersModal.findOne({
        where: { userID: allQuestion[i].answer[j]?.userID },
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      try {
        allQuestion[i].answer[j].answersreply =
          await QuestionsAnswersReplyModal.findOne({
            where: { answerID: allQuestion[i].answer[j]?.answerID },
            raw: true,
          });

        for (
          let k = 0;
          k < allQuestion[i].answer[j]?.answersreply?.length;
          j++
        ) {
          allQuestion[i].answer[j].answersreply[k].user =
            await UsersModal.findOne({
              where: {
                userID: allQuestion[i].answer[j].answersreply[k]?.userID,
              },
              attributes: [
                "userFirstName",
                "userLastName",
                "userProfilePicture",
              ],
              raw: true,
            });
        }
      } catch (err) {
        console.log(err);
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

  try {
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
  } catch (err) {
    console.log(err);
  }

  let questionAnswerAlreadyLike = await QuestionsAnswerLikeModel.findAll({
    where: { answerID: body.answerID, userID: body.userID },
    raw: true,
  });

  if (questionAnswerAlreadyLike.length) {
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

  try {
    let questionAnswerAlreadyUnlike = await QuestionsAnswerUnlikeModel.findOne({
      where: { answerID: body.answerID, userID: body.userID },
      raw: true,
    });

    if (questionAnswerAlreadyUnlike) {
      return { unliked: true };
    } else {
      let questionAnswerUnlikeData = {
        answerID: body.answerID,
        userID: body.userID,
      };

      await QuestionsAnswerUnlikeModel.create(questionAnswerUnlikeData);

      return { unliked: true };
    }
  } catch (err) {
    console.log(err);
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

  if (questionCommentAlreadyLike) {
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

  if (questionCommentAlreadyUnlike) {
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

  if (!question) {
    throw new BadRequestError("You can not archive this question");
  }

  await QuestionModel.update(
    { queStatus: "Archived" },
    {
      where: { queID: body.queID, userID: body.userID },
      raw: true,
    }
  );

  return { archived: true };
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
    where: { queStatus: "Archived", userID: body.userID },
    raw: true,
  });

  for (let i = 0; i < question.length; i++) {
    question[i].user = await UsersModal.findOne({
      where: { userID: question[i].userID },
      attributes: ["userFirstName", "userLastName", "userProfilePicture"],
      raw: true,
    });
  }

  // if(!question) {
  //   throw new BadRequestError('You do not have any archived question')
  // }

  return { slides: question };
};

let MyArchivedPostList = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  let findData = {
    queStatus: "Archived",
    userID: body.userID,
    queType: "Post",
    queMode: "Published",
  };

  let allQuestion = await QuestionModel.findAll({
    where: findData,
    order: [["queID", "DESC"]],
    raw: true,
  });

  for (let i = 0; i < allQuestion.length; i++) {
    if (allQuestion[i].queType == "Post") {
      let queImages = await QuestionImagesModel.findAll({
        where: { queID: allQuestion[i].queID },
      });

      let img = [];
      for (let i = 0; i < queImages.length; i++) {
        img.push(
          config.upload_folder +
            config.upload_entities.post_image_folder +
            queImages[i].image
        );
      }
      allQuestion[i].queImages = img;
    }

    let bookmarked = await QuestionsBookmarkModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

    let liked = await QuestionLikeModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isLiked = liked == 1 ? true : false;

    let unliked = await QuestionUnlikeModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isUnliked = unliked == 1 ? true : false;

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

    allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    let user = await UsersModal.findOne({
      where: { userID: allQuestion[i].userID },
      attributes: ["userFirstName", "userLastName", "userProfilePicture"],
      raw: true,
    });

    user.userProfilePicture = user?.userProfilePicture
      ? config.upload_folder +
        config.upload_entities.user_profile_image_folder +
        user.userProfilePicture
      : config.upload_folder +
        config.upload_entities.user_profile_image_folder +
        "profile_bg.png";
    allQuestion[i].user = user;

    allQuestion[i].comments = await QuestionsCommentModel.findAll({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    for (let j = 0; j < allQuestion[i].comments?.length; j++) {
      allQuestion[i].comments[j].user = await UsersModal.findOne({
        where: { userID: allQuestion[i].comments[j]?.userID },
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      // Comment Like count will be done here
      allQuestion[i].comments[j].commentsLikeCount =
        await QuestionsCommentLikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        });

      // Comment Dislikes count will be done here
      allQuestion[i].comments[j].commentsUnlikeCount =
        await QuestionsCommentUnlikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        });
    }

    allQuestion[i].answer = await QuestionsAnswerModal.findAll({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    for (let j = 0; j < allQuestion[i].answer?.length; j++) {
      allQuestion[i].answer[j].user = await UsersModal.findOne({
        where: { userID: allQuestion[i].answer[j]?.userID },
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      try {
        allQuestion[i].answer[j].answersreply =
          await QuestionsAnswersReplyModal.findOne({
            where: { answerID: allQuestion[i].answer[j]?.answerID },
            raw: true,
          });

        for (
          let k = 0;
          k < allQuestion[i].answer[j]?.answersreply?.length;
          j++
        ) {
          allQuestion[i].answer[j].answersreply[k].user =
            await UsersModal.findOne({
              where: {
                userID: allQuestion[i].answer[j].answersreply[k]?.userID,
              },
              attributes: [
                "userFirstName",
                "userLastName",
                "userProfilePicture",
              ],
              raw: true,
            });
        }
      } catch (err) {
        console.log(err);
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

  if (!question) {
    throw new BadRequestError("You can not active this question");
  }

  await QuestionModel.update(
    { queStatus: "Active" },
    {
      where: { queID: body.queID, userID: body.userID },
      raw: true,
    }
  );

  return { actived: true };
};

let updateQuestion = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  ["queQuestion", "queDescription", "vocationID", "queID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });
  let updatedata = {};
  let optionalFiled = ["queQuestion", "queDescription", "vocationID"];
  optionalFiled.forEach((x) => {
    if (body[x]) {
      updatedata[x] = body[x];
    }
  });

  if (body.status) {
    updatedata.queMode = "Published";
  }

  await QuestionModel.update(updatedata, {
    where: { queID: body.queID },
    raw: true,
  });
};

let getVoilatedQuestion = async (req) => {
  try {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    let limit = body.limit ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let findData = { queStatus: "Voilated" };

    // get voilated questionid
    let voilatedQuestionID = await QuestionModel.findAll({
      where: findData,
      attributes: ["queID"],
      raw: true,
    });

    let reportedQuestionID = await ReportModal.findAll({
      where: { questatus: "Active" },
      attributes: ["queID"],
      raw: true,
    });

    let questionID = [];
    for (let i = 0; i < voilatedQuestionID.length; i++) {
      questionID.push(voilatedQuestionID[i].queID);
    }

    for (let i = 0; i < reportedQuestionID.length; i++) {
      questionID.push(reportedQuestionID[i].queID);
    }

    if (body.page || body.limit) {
      let allQuestion = await QuestionModel.findAll({
        where: { queID: questionID },
        limit,
        offset,
        order: [["queID", "DESC"]],
        raw: true,
      });

      // add status to all question
      allQuestion.forEach((x) => {
        // get voilated questionid
        if (voilatedQuestionID.find((y) => y.queID == x.queID)) {
          x.status = "Voilated";
        }
        if (reportedQuestionID.find((y) => y.queID == x.queID)) {
          x.status = "Reported";
        }
      });




      for (let i = 0; i < allQuestion.length; i++) {
        // allQuestion[i].user = await
        // run raw query to get user first name and last name with industry name

        if(allQuestion[i].status === "Reported"){
          allQuestion[i].reportedDate = await ReportModal.findOne({
            where: { queID: allQuestion[i].queID },
            attributes: ["createdAt"],
            raw: true,
          })
        }

        let user = await sequelize_mysql.query(
          `SELECT userFirstName, userLastName,  industryName FROM users INNER JOIN
           industry ON users.industryID = industry.industryID WHERE userID = ${allQuestion[i].userID}`,
          {
            type: sequelize.QueryTypes.SELECT,
            raw: true,
          }
        );

        allQuestion[i].user = user[0];
      }

      let _result = { total_count: 0 };
      _result.slides = allQuestion;
      _result.total_count = allQuestion.length;
      return _result;
    } else {
      let allQuestion = await QuestionModel.findAll({
        where: { queID: questionID },
        order: [["queID", "DESC"]],
        raw: true,
      });

      for (let i = 0; i < allQuestion.length; i++) {
        let user = await sequelize_mysql.query(
          `SELECT userFirstName, userLastName,  industryName FROM users INNER JOIN
           industry ON users.industryID = industry.industryID WHERE userID = ${allQuestion[i].userID}`,
          {
            type: sequelize.QueryTypes.SELECT,
            raw: true,
          }
        );

        allQuestion[i].user = user[0];
      }
      let _result = { total_count: 0 };
      _result.slides = allQuestion;
      _result.total_count = allQuestion.length;
      return _result;
    }
  } catch (err) {
    throw new BadRequestError(err.message);
  }
};

const getVoildatedAndReportedQuestionDeatils = async (req) => {
  let question;
  const { body } = req;
  ["queID", "status"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  if (body.status === "Reported") {
    question = await sequelize_mysql.query(
      `SELECT questions.queID, questions.queQuestion, questions.queDescription,questions.queMode,
      reportedquestion.reasonID,reportedquestion.reportedID,
      reportedquestion.description as reportedDescription
      FROM questions INNER JOIN reportedquestion ON questions.queID = reportedquestion.queID WHERE questions.queID =  ${body.queID}`,
      {
        type: sequelize.QueryTypes.SELECT,
        raw: true,
      }
    );

    if (question.length === 0) {
      throw new BadRequestError("Question not found");
    }
    question[0].reasonDetail = await sequelize_mysql.query(
      `SELECT reasonName,reasonDescription FROM reasons WHERE reasonID = ${question[0]?.reasonID}`,
      {
        type: sequelize.QueryTypes.SELECT,
        raw: true,
      }
    );
  }
  if (body.status === "Voilated") {
    question = await QuestionModel.findAll({
      where: { queID: body.queID },
      raw: true,
    });
  }
  return question[0];
};

let approveAndRejectQuestion = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["queID", "queStatus"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  if (body.queID.length > 1) {
    // check if all question in report table
    let reportedQuestion = await QuestionModel.findAll({
      where: { queID: body.queID },
      raw: true,
    });

    if (reportedQuestion.length) {
      // change question status to inactive

      if (body.queStatus === "Active") {
        // remove from report table
        await ReportModal.destroy({
          where: { queID: body.queID },
          raw: true,
        });
      } else {
        await ReportModal.update(
          {
            questatus: body.queStatus,
          },
          {
            where: { queID: body.queID },
          }
        );
      }
    }

    // update multiple question
    await QuestionModel.update(
      { queStatus: body.queStatus },
      {
        where: { queID: body.queID },
        raw: true,
      }
    );
  } else {
    let question = await QuestionModel.findOne({
      where: { queID: body.queID },
      raw: true,
    });

    if (!question) {
      throw new BadRequestError("You can not active this question");
    }

    // check if question is available in report table
    let reportQuestion = await ReportModal.findOne({
      where: { queID: body.queID, questatus: "Active" },
      raw: true,
    });

    if (reportQuestion) {
      if (body.queStatus === "Active") {
        await ReportModal.destroy({
          where: { queID: body.queID },
          raw: true,
        });
      } else {
        await ReportModal.update(
          { questatus: body.queStatus },
          {
            where: { queID: body.queID },
            raw: true,
          }
        );
      }
    }
    await QuestionModel.update(
      { queStatus: body.queStatus },
      {
        where: { queID: body.queID },
        raw: true,
      }
    );
  }

  return { updated: true };
};

let ViewAllMyQuestionList = async (body) => {
  let limit = body.limit ? parseInt(body.limit) : 10;
  let page = body.page || 1;
  let offset = (page - 1) * limit;
  let findData = {
    queStatus: "Active",
    queMode: "Published",
    queType: "Question",
  };
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
        let queImages = await QuestionImagesModel.findAll({
          where: { queID: allQuestion[i].queID },
        });

        let img = [];
        for (let i = 0; i < queImages.length; i++) {
          img.push(
            config.upload_folder +
              config.upload_entities.post_image_folder +
              queImages[i].image
          );
        }
        allQuestion[i].queImages = img;
      }

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false;

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isUnliked = unliked == 1 ? true : false;

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
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      user.userProfilePicture = user?.userProfilePicture
        ? config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          user.userProfilePicture
        : config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          "profile_bg.png";
      allQuestion[i].user = user;

      let isFollowed = await userFollowModal.findOne({
        where: { userfollowUserID: allQuestion[i].userID, userID: body.userID },
        raw: true,
      });

      if (isFollowed) {
        allQuestion[i].isFollow = true;
      }
      if (!isFollowed) {
        allQuestion[i].isFollow = false;
      }

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let i = 0; i < allQuestion[i].comments.length; i++) {
        allQuestion[i].comments[i].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[i].userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount =
          await QuestionsCommentLikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount =
          await QuestionsCommentUnlikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });
      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        allQuestion[i].answer[j].user.userProfilePicture =
          user?.userProfilePicture
            ? config.upload_folder +
              config.upload_entities.user_profile_image_folder +
              user.userProfilePicture
            : config.upload_folder +
              config.upload_entities.user_profile_image_folder +
              "profile_bg.png";

        try {
          allQuestion[i].answer[j].answersreply =
            await QuestionsAnswersReplyModal.findAll({
              where: { answerID: allQuestion[i].answer[j]?.answerID },
              raw: true,
            });

          for (
            let k = 0;
            k < allQuestion[i].answer[j]?.answersreply?.length;
            j++
          ) {
            allQuestion[i].answer[j].answersreply[k].user =
              await UsersModal.findOne({
                where: {
                  userID: allQuestion[i].answer[j].answersreply[k]?.userID,
                },
                attributes: [
                  "userFirstName",
                  "userLastName",
                  "userProfilePicture",
                ],
                raw: true,
              });
          }
        } catch (err) {
          console.log(err);
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
        let queImages = await QuestionImagesModel.findAll({
          where: { queID: allQuestion[i].queID },
        });

        let img = [];
        for (let i = 0; i < queImages.length; i++) {
          img.push(
            config.upload_folder +
              config.upload_entities.post_image_folder +
              queImages[i].image
          );
        }
        allQuestion[i].queImages = img;
      }

      let bookmarked = await QuestionsBookmarkModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false;

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isUnliked = unliked == 1 ? true : false;

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
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      try {
        user.userProfilePicture = user?.userProfilePicture
          ? config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            user.userProfilePicture
          : config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            "profile_bg.png";
        allQuestion[i].user = user;
      } catch (err) {
        console.log(err);
      }

      let isFollowed = await userFollowModal.findOne({
        where: { userfollowUserID: allQuestion[i].userID, userID: body.userID },
        raw: true,
      });

      if (isFollowed) {
        allQuestion[i].isFollow = true;
      }
      if (!isFollowed) {
        allQuestion[i].isFollow = false;
      }

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let i = 0; i < allQuestion[i].comments.length; i++) {
        allQuestion[i].comments[i].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[i].userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount =
          await QuestionsCommentLikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount =
          await QuestionsCommentUnlikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });
      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].answer?.length; j++) {
        let user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        user.userProfilePicture = user?.userProfilePicture
          ? config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            user.userProfilePicture
          : config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            "profile_bg.png";
        allQuestion[i].answer[j].user = user;

        let ansReply = await QuestionsAnswersReplyModal.findAll({
          where: { answerID: allQuestion[i].answer[j]?.answerID },
          raw: true,
        });

        allQuestion[i].answer[j].answersreply = ansReply;

        for (
          let k = 0;
          k < allQuestion[i].answer[j]?.answersreply?.length;
          j++
        ) {
          allQuestion[i].answer[j].answersreply[k].user =
            await UsersModal.findOne({
              where: {
                userID: allQuestion[i].answer[j].answersreply[k]?.userID,
              },
              attributes: [
                "userFirstName",
                "userLastName",
                "userProfilePicture",
              ],
              raw: true,
            });
        }
      }
    }
    let allQuestionCount = allQuestion.length;
    let _result = { total_count: 0 };
    _result.slides = allQuestion;
    _result.total_count = allQuestionCount;
    return _result;
  }
};

const viewAllMyDraftQuestion = async (body) => {
  let limit = body.limit ? parseInt(body.limit) : 10;
  let page = body.page || 1;
  let offset = (page - 1) * limit;
  let findData = {
    queStatus: "Active",
    queMode: "Draft",
    userID: body.userID,
    queType: "Question",
  };
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
        let queImages = await QuestionImagesModel.findAll({
          where: { queID: allQuestion[i].queID },
        });

        let img = [];
        for (let i = 0; i < queImages.length; i++) {
          img.push(
            config.upload_folder +
              config.upload_entities.post_image_folder +
              queImages[i].image
          );
        }
        allQuestion[i].queImages = img;
      }

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false;

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isUnliked = unliked == 1 ? true : false;

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
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      user.userProfilePicture = user?.userProfilePicture
        ? config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          user.userProfilePicture
        : config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          "profile_bg.png";
      allQuestion[i].user = user;

      let isFollowed = await userFollowModal.findOne({
        where: { userfollowUserID: allQuestion[i].userID, userID: body.userID },
        raw: true,
      });

      if (isFollowed) {
        allQuestion[i].isFollow = true;
      }
      if (!isFollowed) {
        allQuestion[i].isFollow = false;
      }

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let i = 0; i < allQuestion[i].comments.length; i++) {
        allQuestion[i].comments[i].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[i].userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount =
          await QuestionsCommentLikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount =
          await QuestionsCommentUnlikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });
      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        allQuestion[i].answer[j].user.userProfilePicture =
          user?.userProfilePicture
            ? config.upload_folder +
              config.upload_entities.user_profile_image_folder +
              user.userProfilePicture
            : config.upload_folder +
              config.upload_entities.user_profile_image_folder +
              "profile_bg.png";

        try {
          allQuestion[i].answer[j].answersreply =
            await QuestionsAnswersReplyModal.findAll({
              where: { answerID: allQuestion[i].answer[j]?.answerID },
              raw: true,
            });

          for (
            let k = 0;
            k < allQuestion[i].answer[j]?.answersreply?.length;
            j++
          ) {
            allQuestion[i].answer[j].answersreply[k].user =
              await UsersModal.findOne({
                where: {
                  userID: allQuestion[i].answer[j].answersreply[k]?.userID,
                },
                attributes: [
                  "userFirstName",
                  "userLastName",
                  "userProfilePicture",
                ],
                raw: true,
              });
          }
        } catch (err) {
          console.log(err);
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
        let queImages = await QuestionImagesModel.findAll({
          where: { queID: allQuestion[i].queID },
        });

        let img = [];
        for (let i = 0; i < queImages.length; i++) {
          img.push(
            config.upload_folder +
              config.upload_entities.post_image_folder +
              queImages[i].image
          );
        }
        allQuestion[i].queImages = img;
      }

      let bookmarked = await QuestionsBookmarkModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false;

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isUnliked = unliked == 1 ? true : false;

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
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      user.userProfilePicture = user?.userProfilePicture
        ? config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          user.userProfilePicture
        : config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          "profile_bg.png";
      allQuestion[i].user = user;

      let isFollowed = await userFollowModal.findOne({
        where: { userfollowUserID: allQuestion[i].userID, userID: body.userID },
        raw: true,
      });

      if (isFollowed) {
        allQuestion[i].isFollow = true;
      }
      if (!isFollowed) {
        allQuestion[i].isFollow = false;
      }

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let i = 0; i < allQuestion[i].comments.length; i++) {
        allQuestion[i].comments[i].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[i].userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount =
          await QuestionsCommentLikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount =
          await QuestionsCommentUnlikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });
      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].answer?.length; j++) {
        let user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        user.userProfilePicture = user?.userProfilePicture
          ? config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            user.userProfilePicture
          : config.upload_folder +
            config.upload_entities.user_profile_image_folder +
            "profile_bg.png";
        allQuestion[i].answer[j].user = user;

        let ansReply = await QuestionsAnswersReplyModal.findAll({
          where: { answerID: allQuestion[i].answer[j]?.answerID },
          raw: true,
        });

        allQuestion[i].answer[j].answersreply = ansReply;

        for (
          let k = 0;
          k < allQuestion[i].answer[j]?.answersreply?.length;
          j++
        ) {
          allQuestion[i].answer[j].answersreply[k].user =
            await UsersModal.findOne({
              where: {
                userID: allQuestion[i].answer[j].answersreply[k]?.userID,
              },
              attributes: [
                "userFirstName",
                "userLastName",
                "userProfilePicture",
              ],
              raw: true,
            });
        }
      }
    }
    let allQuestionCount = allQuestion.length;
    let _result = { total_count: 0 };
    _result.slides = allQuestion;
    _result.total_count = allQuestionCount;
    return _result;
  }
};

const myBookmarkQuestion = async (body) => {
  let findData = {
    userID: body.userID,
  };

  let allBookMarkQuestion = await QuestionsBookmarkModel.findAll({
    where: findData,
    raw: true,
  });

  let allQuestion = await QuestionModel.findAll({
    where: {
      queID: allBookMarkQuestion.map((item) => item.queID),
      queMode: "Published",
      queStatus: "Active",
    },
    order: [["queCreatedDate", "DESC"]],
    raw: true,
  });

  for (let i = 0; i < allQuestion.length; i++) {
    if (allQuestion[i].queType == "Post") {
      let queImages = await QuestionImagesModel.findAll({
        where: { queID: allQuestion[i].queID },
      });

      let img = [];
      for (let i = 0; i < queImages.length; i++) {
        img.push(
          config.upload_folder +
            config.upload_entities.post_image_folder +
            queImages[i].image
        );
      }
      allQuestion[i].queImages = img;
    }

    let bookmarked = await QuestionsBookmarkModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

    let liked = await QuestionLikeModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isLiked = liked == 1 ? true : false;

    let unliked = await QuestionUnlikeModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isUnliked = unliked == 1 ? true : false;

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

    allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    let user = await UsersModal.findOne({
      where: { userID: allQuestion[i].userID },
      attributes: ["userFirstName", "userLastName", "userProfilePicture"],
      raw: true,
    });

    user.userProfilePicture = user?.userProfilePicture
      ? config.upload_folder +
        config.upload_entities.user_profile_image_folder +
        user.userProfilePicture
      : config.upload_folder +
        config.upload_entities.user_profile_image_folder +
        "profile_bg.png";
    allQuestion[i].user = user;

    allQuestion[i].comments = await QuestionsCommentModel.findAll({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    for (let j = 0; j < allQuestion[i].comments?.length; j++) {
      allQuestion[i].comments[j].user = await UsersModal.findOne({
        where: { userID: allQuestion[i].comments[j]?.userID },
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      // Comment Like count will be done here
      allQuestion[i].comments[j].commentsLikeCount =
        await QuestionsCommentLikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        });

      // Comment Dislikes count will be done here
      allQuestion[i].comments[j].commentsUnlikeCount =
        await QuestionsCommentUnlikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        });
    }

    allQuestion[i].answer = await QuestionsAnswerModal.findAll({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    for (let j = 0; j < allQuestion[i].answer?.length; j++) {
      allQuestion[i].answer[j].user = await UsersModal.findOne({
        where: { userID: allQuestion[i].answer[j]?.userID },
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      // for(let i=0; i<allQuestion[i].answer[j].user.length; i++) {
      //   allQuestion[i].answer[j].user[i].images = await QuestionImagesModel.findAll({
      //     where : {  }
      //   })
      // }

      try {
        allQuestion[i].answer[j].answersreply =
          await QuestionsAnswersReplyModal.findOne({
            where: { answerID: allQuestion[i].answer[j]?.answerID },
            raw: true,
          });

        for (
          let k = 0;
          k < allQuestion[i].answer[j]?.answersreply?.length;
          j++
        ) {
          allQuestion[i].answer[j].answersreply[k].user =
            await UsersModal.findOne({
              where: {
                userID: allQuestion[i].answer[j].answersreply[k]?.userID,
              },
              attributes: [
                "userFirstName",
                "userLastName",
                "userProfilePicture",
              ],
              raw: true,
            });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  let allQuestionCount = await QuestionModel.count({
    where: { queID: allBookMarkQuestion.map((item) => item.queID) },
    order: [["queID", "DESC"]],
    raw: true,
  });

  let _result = { total_count: 0 };
  _result.slides = allQuestion;
  _result.total_count = allQuestionCount;
  return _result;
};

const reportQuestion = async (body) => {
  let question = await QuestionModel.findOne({
    where: { queID: body.queID },
    raw: true,
  });

  if (question) {
    let isReported = await ReportModal.count({
      where: { queID: body.queID, userID: body.userID },
    });

    try {
      if (isReported == 0) {
        let report = await ReportModal.create({
          queID: body.queID,
          userID: body.userID,
          reasonID: body.reasonID,
          description: body.description,
          questatus: "Active",
        });

        if (report) {
          return {
            status: true,
          };
        }
      } else {
        return {
          status: false,
          message: "You have already reported this question",
        };
      }
    } catch (err) {
      console.log(err);
    }
  }
  return {
    status: false,
  };
};

const getSharedQuestion = async (req) => {
  try {
    const body = req.body;
    let findData = {};

    let allQuestion = await QuestionModel.findAll({
      where: {
        queID: body.queID,
        queMode: "Published",
        queStatus: "Active",
      },
      order: [["queCreatedDate", "DESC"]],
      raw: true,
    });

    for (let i = 0; i < allQuestion.length; i++) {
      if (allQuestion[i].queType == "Post") {
        let queImages = await QuestionImagesModel.findAll({
          where: { queID: allQuestion[i].queID },
        });

        let img = [];
        for (let i = 0; i < queImages.length; i++) {
          img.push(
            config.upload_folder +
              config.upload_entities.post_image_folder +
              queImages[i].image
          );
        }
        allQuestion[i].queImages = img;
      }

      let bookmarked = await QuestionsBookmarkModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

      let liked = await QuestionLikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isLiked = liked == 1 ? true : false;

      let unliked = await QuestionUnlikeModel.count({
        where: { queID: allQuestion[i].queID, userID: body.userID },
        raw: true,
      });

      allQuestion[i].isUnliked = unliked == 1 ? true : false;

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
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      user.userProfilePicture = user?.userProfilePicture
        ? config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          user.userProfilePicture
        : config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          "profile_bg.png";
      allQuestion[i].user = user;

      allQuestion[i].comments = await QuestionsCommentModel.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].comments?.length; j++) {
        allQuestion[i].comments[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].comments[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        // Comment Like count will be done here
        allQuestion[i].comments[j].commentsLikeCount =
          await QuestionsCommentLikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });

        // Comment Dislikes count will be done here
        allQuestion[i].comments[j].commentsUnlikeCount =
          await QuestionsCommentUnlikeModel.count({
            where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
            raw: true,
          });
      }

      allQuestion[i].answer = await QuestionsAnswerModal.findAll({
        where: { queID: allQuestion[i].queID },
        raw: true,
      });

      for (let j = 0; j < allQuestion[i].answer?.length; j++) {
        allQuestion[i].answer[j].user = await UsersModal.findOne({
          where: { userID: allQuestion[i].answer[j]?.userID },
          attributes: ["userFirstName", "userLastName", "userProfilePicture"],
          raw: true,
        });

        try {
          allQuestion[i].answer[j].answersreply =
            await QuestionsAnswersReplyModal.findOne({
              where: { answerID: allQuestion[i].answer[j]?.answerID },
              raw: true,
            });

          for (
            let k = 0;
            k < allQuestion[i].answer[j]?.answersreply?.length;
            j++
          ) {
            allQuestion[i].answer[j].answersreply[k].user =
              await UsersModal.findOne({
                where: {
                  userID: allQuestion[i].answer[j].answersreply[k]?.userID,
                },
                attributes: [
                  "userFirstName",
                  "userLastName",
                  "userProfilePicture",
                ],
                raw: true,
              });
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
    let allQuestionCount = await QuestionModel.count({
      where: { queID: body.queID, queMode: "Published", queStatus: "Active" },
      order: [["queID", "DESC"]],
      raw: true,
    });

    let _result = { total_count: 0 };
    _result.slides = allQuestion;
    _result.total_count = allQuestionCount;
    return _result;
  } catch (error) {
    console.log(error);
    throw new BadRequestError(error.message);
  }
};

let AnswerReplyLike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["replyID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  try {
    let AnswerReplyUnlike = await AnswerReplyUnlikeModel.findAll({
      where: { replyID: body.replyID, userID: body.userID },
      raw: true,
    });
    if (AnswerReplyUnlike) {
      await AnswerReplyUnlikeModel.destroy({
        where: { replyID: body.replyID, userID: body.userID },
        raw: true,
      });
    }
  } catch (err) {
    console.log(err);
  }

  let AnswerReplyAlreadyLike = await AnswerReplyLikeModel.findAll({
    where: { replyID: body.replyID, userID: body.userID },
    raw: true,
  });

  if (AnswerReplyAlreadyLike.length) {
    return { answerrepliyliked: true };
  } else {
    let AnswerReplyAlreadyLike = {
      replyID: body.replyID,
      userID: body.userID,
    };

    await AnswerReplyLikeModel.create(AnswerReplyAlreadyLike);

    return { answerrepliyliked: true };
  }
};

let AnswerReplyUnlike = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["replyID", "userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let AnswerReplyLike = await AnswerReplyLikeModel.findOne({
    where: { replyID: body.replyID, userID: body.userID },
    raw: true,
  });

  if (AnswerReplyLike) {
    await AnswerReplyLikeModel.destroy({
      where: { replyID: body.replyID, userID: body.userID },
      raw: true,
    });
  }

  try {
    let AnswerReplyAlreadyUnlike = await AnswerReplyUnlikeModel.findOne({
      where: { replyID: body.replyID, userID: body.userID },
      raw: true,
    });

    if (AnswerReplyAlreadyUnlike) {
      return { answerreplyunliked: true };
    } else {
      let AnswerReplyUnlikeData = {
        replyID: body.replyID,
        userID: body.userID,
      };

      await AnswerReplyUnlikeModel.create(AnswerReplyUnlikeData);

      return { answerreplyunliked: true };
    }
  } catch (err) {
    console.log(err);
  }
};

let AnswerUpdate = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["answerID", "queID", "userID", "answerAnswer"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionsAnswerModel.findOne({
    where: { queID: body.queID, userID: body.userID, answerID: body.answerID },
    raw: true,
  });

  if (!question) {
    throw new BadRequestError("Answer doesn't exist!");
  }

  // if(questionLike) {
  //   await QuestionLikeModel
  //   .destroy({ where: {queID : body.queID , userID: body.userID}, raw: true });
  // }

  let questionsAnswerData = {
    queID: body.queID,
    userID: body.userID,
    answerAnswer: body.answerAnswer,
  };

  let answerData = await QuestionsAnswerModel.update(questionsAnswerData, {
    where: { answerID: body.answerID },
  });

  return { slides: answerData };
};

const archiveAnswer = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["answerID", "queID", "status"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let question = await QuestionsAnswerModel.findOne({
    where: {
      queID: body.queID,
      answerID: body.answerID,
      answerStatus: "Archived",
    },
    raw: true,
  });

  if (question) {
    throw new BadRequestError("Answer already archived!");
  }

  let questionsAnswerData = {
    queID: body.queID,
    answerStatus: body.status,
  };
  let answerData = await QuestionsAnswerModel.update(questionsAnswerData, {
    where: { answerID: body.answerID },
  });

  return { slides: answerData };
};

const myArchiveAnswer = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;

  ["userID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let questions = await QuestionsAnswerModel.findAll({
    where: { userID: body.userID, answerStatus: "Archived" },
    raw: true,
  });

  let findData = {
    queStatus: "Active",
    queType: "Question",
    queMode: "Published",
    queID: questions.map((x) => x.queID),
  };

  let allQuestion = await QuestionModel.findAll({
    where: findData,
    order: [["queID", "DESC"]],
    raw: true,
  });

  for (let i = 0; i < allQuestion.length; i++) {
    if (allQuestion[i].queType == "Post") {
      let queImages = await QuestionImagesModel.findAll({
        where: { queID: allQuestion[i].queID },
      });

      let img = [];
      for (let i = 0; i < queImages.length; i++) {
        img.push(
          config.upload_folder +
            config.upload_entities.post_image_folder +
            queImages[i].image
        );
      }
      allQuestion[i].queImages = img;
    }

    let bookmarked = await QuestionsBookmarkModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isBookMarked = bookmarked == 1 ? true : false;

    let liked = await QuestionLikeModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isLiked = liked == 1 ? true : false;

    let unliked = await QuestionUnlikeModel.count({
      where: { queID: allQuestion[i].queID, userID: body.userID },
      raw: true,
    });

    allQuestion[i].isUnliked = unliked == 1 ? true : false;

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

    allQuestion[i].queTotalBookmarkCount = await QuestionsBookmarkModel.count({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    allQuestion[i].queTotalCommentCount = await QuestionsCommentModel.count({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    let user = await UsersModal.findOne({
      where: { userID: allQuestion[i].userID },
      attributes: ["userFirstName", "userLastName", "userProfilePicture"],
      raw: true,
    });

    user.userProfilePicture = user?.userProfilePicture
      ? config.upload_folder +
        config.upload_entities.user_profile_image_folder +
        user.userProfilePicture
      : config.upload_folder +
        config.upload_entities.user_profile_image_folder +
        "profile_bg.png";
    allQuestion[i].user = user;

    allQuestion[i].comments = await QuestionsCommentModel.findAll({
      where: { queID: allQuestion[i].queID },
      raw: true,
    });

    for (let j = 0; j < allQuestion[i].comments?.length; j++) {
      allQuestion[i].comments[j].user = await UsersModal.findOne({
        where: { userID: allQuestion[i].comments[j]?.userID },
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      // Comment Like count will be done here
      allQuestion[i].comments[j].commentsLikeCount =
        await QuestionsCommentLikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        });

      // Comment Dislikes count will be done here
      allQuestion[i].comments[j].commentsUnlikeCount =
        await QuestionsCommentUnlikeModel.count({
          where: { queCommentID: allQuestion[i].comments[j]?.queCommentID },
          raw: true,
        });
    }

    allQuestion[i].answer = await QuestionsAnswerModal.findAll({
      where: {
        queID: allQuestion[i].queID,
        answerStatus: "Archived",
        userID: body.userID,
      },
      raw: true,
    });

    for (let j = 0; j < allQuestion[i].answer?.length; j++) {
      allQuestion[i].answer[j].user = await UsersModal.findOne({
        where: { userID: allQuestion[i].answer[j]?.userID },
        attributes: ["userFirstName", "userLastName", "userProfilePicture"],
        raw: true,
      });

      allQuestion[i].answer[j].user.userProfilePicture = allQuestion[i].answer[
        j
      ].user.userProfilePicture
        ? config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          allQuestion[i].answer[j].user.userProfilePicture
        : config.upload_folder +
          config.upload_entities.user_profile_image_folder +
          "profile_bg.png";

      try {
        allQuestion[i].answer[j].answersreply =
          await QuestionsAnswersReplyModal.findOne({
            where: { answerID: allQuestion[i].answer[j]?.answerID },
            raw: true,
          });

        for (
          let k = 0;
          k < allQuestion[i].answer[j]?.answersreply?.length;
          j++
        ) {
          allQuestion[i].answer[j].answersreply[k].user =
            await UsersModal.findOne({
              where: {
                userID: allQuestion[i].answer[j].answersreply[k]?.userID,
              },
              attributes: [
                "userFirstName",
                "userLastName",
                "userProfilePicture",
              ],
              raw: true,
            });
        }
      } catch (err) {
        console.log(err);
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
  QuestionArchive: QuestionArchive,
  MyArchivedQuestionsList: MyArchivedQuestionsList,
  QuestionActivate: QuestionActivate,
  updateQuestion: updateQuestion,
  getVoilatedQuestion: getVoilatedQuestion,
  approveAndRejectQuestion: approveAndRejectQuestion,
  ViewAllMyQuestionList: ViewAllMyQuestionList,
  viewAllMyDraftQuestion: viewAllMyDraftQuestion,
  myBookmarkQuestion,
  reportQuestion,
  getSharedQuestion,
  AnswerReplyLike,
  AnswerReplyUnlike,
  AnswerUpdate,
  archiveAnswer,
  MyPostList,
  MyArchivedPostList,
  myArchiveAnswer,
  getVoildatedAndReportedQuestionDeatils,
};
