'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/upcoming_service"),    
    validateAccess = require('../../policies/Validate_request_access');

router.post("/submit_feedback", validateAccess.isValidUser, controller.SubmitFeedback);
router.post("/service_feedback_list", validateAccess.isValidUser, controller.UpcomingServiceFeedbacks);
module.exports = router;