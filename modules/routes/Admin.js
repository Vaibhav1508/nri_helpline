"use strict";

let express = require("express"),
  router = express.Router(),
  controller = require("../controllers/Admin"),
  validateAccess = require("../policies/Validate_request_access"),
  helper = require("../helpers/file_upload");

router.post("/login", controller.Login);
router.get("/detail", validateAccess.isValidAdmin,controller.UsersDetail);
router.put("/profile_update",validateAccess.isValidAdmin, helper.uploadAdminImage.single('admin_image'), controller.UserUpdate);
router.post("/forget_password", controller.ForgetPassword);
router.post("/reset_password", controller.ResetPassword);
router.post("/change_password", controller.ChangePassword);


router.post("/send_otp", controller.SendOtp);

module.exports = router;
