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

module.exports = router;
