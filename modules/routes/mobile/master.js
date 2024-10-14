'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../../controllers/mobile/master"),    
    helper = require("../../helpers/file_upload");

router.post("/list", controller.MasterList);

module.exports = router;