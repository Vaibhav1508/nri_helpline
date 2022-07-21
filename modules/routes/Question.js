"use strict";

let express = require("express"),
  router = express.Router(),
  controller = require("../controllers/Question"),
  helper = require("../helpers/file_upload"),
  validateAccess = require("../policies/Validate_request_access");

router.post(
  "/createquestions",
  helper.uploadPostImage.any(),
  controller.CreateQuestion
);
router.post("/updatequestions", controller.updateQuestion);
router.post("/questionslist", controller.QuestionList);
router.post("/myquestionslist", controller.MyQuestionList);
router.post("/questionslike", controller.QuestionLike);
router.post("/questionsunlike", controller.QuestionUnlike);
router.post("/questionsanswer", controller.QuestionsAnswer);
router.post("/questionscomment", controller.QuestionsComment);
router.post("/questionscommentlike", controller.QuestionsCommentLike);
router.post("/questionscommentunlike", controller.QuestionsCommentUnLike);
router.post("/questionsbookmark", controller.QuestionsBookmark);
router.post("/questionsunbookmark", controller.QuestionsUnBookmark);
router.post("/questionsanswerreply", controller.QuestionsAnswersReply);
router.post("/questionsanswerlike", controller.QuestionsAnswerLike);
router.post("/questionsanswerunlike", controller.QuestionsAnswerUnlike);
router.post("/questionarchive", controller.QuestionArchive);
router.post("/questionactivate", controller.QuestionActivate);
router.post("/myarchivedquestion", controller.MyArchivedQuestionsList);
router.post("/viewallquestionslist", controller.ViewAllMyQuestionList);
router.post("/viewalldraftquestionslist", controller.viewAllMyDraftQuestion);
router.post("/voilatedquestionslist", controller.getVoilatedQuestions);
router.post("/approveandrejectquestion", controller.approveAndRejectQuestion);
router.post("/mybookmarklist", controller.myBookmarkQuestion);
router.post("/reportquestion", controller.reportQuestion);
router.post("/getquestion", controller.getSharedQuestion);

module.exports = router;
