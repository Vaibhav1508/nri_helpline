'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/city"),    
    helper = require("../../helpers/file_upload"),
    validateAccess = require('../../policies/Validate_request_access');

router.post("/list", controller.CityList);


module.exports = router;