'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/poll_questions"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/create", validateAccess.isValidAdmin, controller.CreateQuestion);
router.post("/list", validateAccess.isValidAdmin, controller.QuestionList);
router.put("/update/:id", validateAccess.isValidAdmin, controller.UpdateQuestion);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.QuestionDetail);
router.post("/delete", validateAccess.isValidAdmin, controller.DeleteQuestion);
router.post("/user-list", validateAccess.isValidAdmin, controller.PollUserList);

router.post("/survey_result", validateAccess.isValidAdmin, controller.SurveyResult);
router.get("/survey_result_detail/:id", validateAccess.isValidAdmin, controller.SurveyResultDetail);

module.exports = router;