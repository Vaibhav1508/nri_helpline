'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/news"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/create", validateAccess.isValidAdmin, helper.uploadNewsImage.single('v_image_name'),controller.CreateNews);
router.post("/list", validateAccess.isValidAdmin, controller.NewsList);
router.put("/update/:id", validateAccess.isValidAdmin, helper.uploadNewsImage.single('v_image_name'),controller.UpdateNews);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.NewsDetail);
router.post("/delete", validateAccess.isValidAdmin, controller.DeleteNews);

module.exports = router;