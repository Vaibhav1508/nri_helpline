'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/upcoming_service"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/create", validateAccess.isValidAdmin, helper.uploadUpcomingServiceIconImage.single('v_icon_image'),controller.CreateUpcomingService);
router.post("/list", validateAccess.isValidAdmin, controller.UpcomingServiceList);
router.put("/update/:id", validateAccess.isValidAdmin, helper.uploadUpcomingServiceIconImage.single('v_icon_image'),controller.UpdateUpcomingService);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.UpcomingServiceDetail);
router.post("/delete", validateAccess.isValidAdmin, controller.DeleteUpcomingService);

module.exports = router;