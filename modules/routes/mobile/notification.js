'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/notification"),    
    validateAccess = require('../../policies/Validate_request_access');

router.post("/list", validateAccess.isValidUser, controller.NotificationList);
router.post("/read", validateAccess.isValidUser, controller.NotificationRead);

module.exports = router;