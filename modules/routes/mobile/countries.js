'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/countries"),    
    helper = require("../../helpers/file_upload");

router.post("/list", controller.CountryList);

module.exports = router;