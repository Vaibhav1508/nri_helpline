'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/home_screen"),    
    validateAccess = require('../../policies/Validate_request_access');

router.get("/", validateAccess.isValidUser, controller.HomeScreen);

module.exports = router;