'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/state"),    
    helper = require("../../helpers/file_upload"),
    validateAccess = require('../../policies/Validate_request_access');
    
router.post("/list", controller.StateList);

module.exports = router;