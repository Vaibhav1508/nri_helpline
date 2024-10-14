'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/upcoming_service_feedback"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

// router.post("/create", validateAccess.isValidAdmin, helper.uploadCategoryImage.single('v_image'),controller.CreateCategory);
router.post("/list", validateAccess.isValidAdmin, controller.ServiceFeedbackList);
router.put("/update/:id", validateAccess.isValidAdmin,controller.UpdateServiceFeedback);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.ServiceFeedbackDetail);
router.get("/users", validateAccess.isValidAdmin, controller.ServiceFeedbackUsers);
router.post("/delete", validateAccess.isValidAdmin, controller.DeleteFeedback);

module.exports = router;