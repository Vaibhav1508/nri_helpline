'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/tags"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/create", validateAccess.isValidAdmin, controller.CreateTag);
router.post("/list", validateAccess.isValidAdmin, controller.TagList);
router.put("/update/:id", validateAccess.isValidAdmin, controller.UpdateTag);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.TagDetail);
router.post("/delete", validateAccess.isValidAdmin, controller.DeleteTag);

module.exports = router;