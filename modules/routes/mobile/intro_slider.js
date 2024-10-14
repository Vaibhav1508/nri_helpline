'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/intro_slider"),    
    helper = require("../../helpers/file_upload");

    router.post("/list", controller.SliderList);

module.exports = router;