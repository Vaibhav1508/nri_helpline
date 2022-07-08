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
router.get("/state-by-country/:countryID", controller.getStateByCountryID);

router.post("/create-city", controller.createCity);
router.put("/update-city/:cityID", controller.updateCity);
router.post("/city-list", controller.cityList);
router.get("/city-detail/:cityID", controller.cityDetail);
router.post("/change-city-status", controller.changeCityStatus);
router.get("/city-by-state/:stateID", controller.getCityByStateID);

//reasons api
router.post("/create-reasons", controller.CreateReasons);
router.post("/get-reasons", controller.GetReasons);
router.put("/reason-update/:reasonID", controller.ReasonsUpdate);
router.post("/reasondetail/:reasonID", controller.ReasonDetail);
router.post("/changereasonstatus", controller.ChangeReasonStatus);

module.exports = router;
