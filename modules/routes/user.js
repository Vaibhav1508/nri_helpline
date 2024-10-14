'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/user"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

// router.post("/create", validateAccess.isValidAdmin, helper.uploadCategoryImage.single('v_image'),controller.CreateCategory);
router.post("/list", validateAccess.isValidAdmin, controller.UserList);
router.put("/update/:id", validateAccess.isValidAdmin, helper.uploadProfileImage.single('v_profile_image'),controller.UpdateUser);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.UserDetail);
router.post("/delete", validateAccess.isValidAdmin, controller.DeleteUser);

module.exports = router;