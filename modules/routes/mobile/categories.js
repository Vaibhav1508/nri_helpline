'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/categories"),    
    validateAccess = require('../../policies/Validate_request_access');

router.get("/list", validateAccess.isValidUser, controller.Categories);

module.exports = router;