"use strict";

let express = require("express"),
  router = express.Router(),
  controller = require("../controllers/Admin"),
  validateAccess = require("../policies/Validate_request_access"),
  helper = require("../helpers/file_upload");

router.post("/login", controller.Login);
router.patch(
  "/changepassword",
  validateAccess.isValidAdmin,
  controller.changePassword
);
router.post("/logOut", validateAccess.isValidAdmin, controller.signout);
router.post("/userslist", controller.UsersList);
router.post("/user/:userID", controller.UsersDetail);
router.put("/user-update/:userID", controller.UserUpdate);
router.post("/changeusersatus", controller.ChangeUserStatus);
router.post("/createassociate", controller.createBussinessAssociate);
router.post("/associateList", controller.getAssociateList);
router.get("/associate/:userID", controller.AssociateDetails);
router.post("/associate-update/:userID", controller.AssociateUpdate);
router.post("/approve-hr", controller.ApproveHr);
router.post("/reject-hr", controller.RejectHr);
router.post(
  "/kyc-document",
  helper.uploadHrKycDocuments,
  controller.uploadKycDocument
);

module.exports = router;
