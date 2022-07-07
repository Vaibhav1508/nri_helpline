"use strict";

let express = require("express"),
  router = express.Router(),
  controller = require("../controllers/Master"),
  helper = require("../helpers/file_upload"),
  validateAccess = require("../policies/Validate_request_access");

router.post(
  "/create-country",
  helper.uploadCountryPicture.single("countryPicture"),
  controller.createCountry
);
router.put(
  "/country-update/:countryID",
  helper.uploadCountryPicture.single("countryPicture"),
  controller.CountryUpdate
);
router.post("/country-list", controller.CountryList);
router.get("/country-detail/:countryID", controller.countryDetail);
router.post("/change-country-status", controller.changeCountryStatus);

router.post("/create-state", controller.createState);
router.put("/update-state/:stateID", controller.updateState);
router.post("/state-list", controller.stateList);
router.get("/state-detail/:stateID", controller.stateDetail);
router.post("/change-state-status", controller.changeStateStatus);

module.exports = router;
