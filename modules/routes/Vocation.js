'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/Vocation"),    
    helper = require("../helpers/file_upload"),
    validateAccess = require('../policies/Validate_request_access');

router.post("/adminvocationslist",controller.AdminVocationsList);
router.post("/adminsubvocationslist",controller.AdminSubVocationsList);

router.post("/createvocation",helper.uploadVocationImage.single('vocationImage'),controller.CreateVocation);
router.post("/vocationslist",controller.VocationsList);
router.post("/changevocationstatus",controller.ChangeVocationStatus);
router.post("/userselectvocation",controller.UserSelectVocation);
router.post("/createsubvocation",helper.uploadSubVocationImage.single('subVocationImage'),controller.CreateSubVocation);
router.post("/subvocationslist",controller.SubVocationsList);
router.post("/changesubvocationstatus",controller.ChangeSubVocationStatus);
router.post("/vocationdetail/:vocationID",controller.VocationDetail);
router.post("/subvocationdetail/:vocationID",controller.SubVocationDetail);
router.put("/vocation-update/:vocationID",helper.uploadVocationImage.single('vocationImage'),controller.VocationUpdate);
router.put("/subvocation-update/:vocationID",helper.uploadSubVocationImage.single('subVocationImage'),controller.SubVocationUpdate);
router.post("/getsuggetion",controller.GetSuggetion);

router.post("/vocationcreate",helper.uploadVocationImage.single('vocationImage'),controller.VocationCreate);
router.get("/selectvocationlist",controller.SelectVocationsList);
router.put("/update-vocation/:vocationID",helper.uploadVocationImage.single('vocationImage'),controller.UpdateVocation);

module.exports = router;
