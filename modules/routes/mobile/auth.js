"use strict";

let express = require("express"),
  router = express.Router(),
  controller = require("../../controllers/mobile/auth"),
  helper = require("../../helpers/file_upload"),
  validateAccess = require('../../policies/Validate_request_access');

router.post("/send_otp", controller.SendOtp);
router.post("/verify_otp", controller.VerifyOtp);
router.post("/update_profile", validateAccess.isValidUser, helper.uploadProfileImage.single('v_profile_image'), controller.UpdateProfile);
router.get("/profile_detail", validateAccess.isValidUser, controller.ProfileDetail);
router.post("/list", validateAccess.isValidUser, controller.ProfessionList);

router.post("/logout", validateAccess.isValidUser, controller.LogoutUser);
router.post("/delete_account", validateAccess.isValidUser, controller.DeleteUserAccount);

module.exports = router;
