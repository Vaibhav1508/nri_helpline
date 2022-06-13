'use strict';

let express    = require("express"),
    router     = express.Router(),
    controller = require("../controllers/Industry");

router.post("/addindustry",controller.CreateIndustry);
router.post("/getindustry",controller.GetIndustry);
router.post("/getwebindustry",controller.GetWebIndustry);
router.post("/changeindustrystatus",controller.ChangeIndustryStatus);
router.post("/industrydetail/:industryID",controller.IndustryDetail);
router.put("/industry-update/:industryID",controller.IndustryUpdate);

module.exports = router;
