'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/slider"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/create", validateAccess.isValidAdmin, helper.uploadSliderImage.single('v_image'),controller.CreateSlider);
router.post("/list", validateAccess.isValidAdmin, controller.SliderList);
router.put("/update/:id", validateAccess.isValidAdmin, helper.uploadSliderImage.single('v_image'),controller.UpdateSlider);
router.get("/detail/:id", validateAccess.isValidAdmin, controller.SliderDetail);
router.post("/delete", validateAccess.isValidAdmin, controller.DeleteSlider);

module.exports = router;