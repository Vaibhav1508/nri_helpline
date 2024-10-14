'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/dashboard"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/", validateAccess.isValidAdmin, controller.Dashboard);

module.exports = router;