'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/push_notification"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/send", validateAccess.isValidAdmin, helper.uploadNotificationImage.single('v_image'),controller.SendNotification);
router.post("/list", validateAccess.isValidAdmin, controller.NotificationList);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.NotificationDetail);

module.exports = router;