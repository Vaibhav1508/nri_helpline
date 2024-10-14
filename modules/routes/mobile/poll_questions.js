'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/poll_questions"),    
    helper = require("../../helpers/file_upload"),
    validateAccess = require('../../policies/Validate_request_access');
    
router.post("/list", validateAccess.isValidUser, controller.QuestionsList);
router.post("/answer", validateAccess.isValidUser, controller.QuestionsAnswer);

module.exports = router;