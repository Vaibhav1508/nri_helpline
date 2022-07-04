"use strict";

let express = require("express"),
  router = express.Router(),
  controller = require("../controllers/Users"),
  helper = require("../helpers/file_upload"),
  validateAccess = require("../policies/Validate_request_access");

router.post("/login", controller.Login);
router.patch(
  "/changepassword",
  validateAccess.isValidAdmin,
  controller.changePassword
);
router.post("/logOut", validateAccess.isValidAdmin, controller.signout);
router.post("/register", controller.register);
router.post("/verifyotp", controller.VerifyOtp);
router.post("/resendotp", controller.ResendOtp);
router.post("/forgetpassword", controller.ForgetPassword);
router.post("/setnewpassword", controller.SetNewPassword);
router.post("/profilesetup", controller.ProfileSetup);
router.put(
  "/user-update/:userID",
  helper.userProfilePicture.single("userProfilePicture"),
  controller.UserUpdate
);
router.post("/company-details", controller.CompanyDetails);

module.exports = router;
