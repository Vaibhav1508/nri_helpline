'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/Question"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/createquestions",helper.uploadPostImage.single('postImage'),controller.CreateQuestion);
router.post("/questionslist",controller.QuestionList);
router.post("/myquestionslist",controller.MyQuestionList);
router.post("/questionslike",controller.QuestionLike);
router.post("/questionsunlike",controller.QuestionUnlike);
router.post("/questionsanswer",controller.QuestionsAnswer);
router.post("/questionscomment",controller.QuestionsComment);
router.post("/questionsbookmark",controller.QuestionsBookmark);
router.post("/questionsunbookmark",controller.QuestionsUnBookmark);
router.post("/questionsanswerreply",controller.QuestionsAnswersReply);
router.post("/questionsanswerlike",controller.QuestionsAnswerLike);
router.post("/questionsanswerunlike",controller.QuestionsAnswerUnlike);

module.exports = router;
