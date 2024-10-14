'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/news"),    
    validateAccess = require('../../policies/Validate_request_access');

router.post("/list", validateAccess.isValidUser, controller.NewsList);

module.exports = router;