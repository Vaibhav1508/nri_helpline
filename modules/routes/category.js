'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/category"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/create", validateAccess.isValidAdmin, helper.uploadCategoryImage.single('v_image'),controller.CreateCategory);
router.post("/list", validateAccess.isValidAdmin, controller.CategoryList);
router.put("/update/:id", validateAccess.isValidAdmin, helper.uploadCategoryImage.single('v_image'),controller.UpdateCategory);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.CategoryDetail);
router.post("/delete", validateAccess.isValidAdmin, controller.DeleteCategory);

module.exports = router;