"use strict";

let helper = require("../helpers/helpers"),
  _ = require("lodash"),
  md5 = require("md5"),
  config = process.config.global_config,
  CountryModel = require("../models/Country"),
  BadRequestError = require("../errors/badRequestError");

let createCountry = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["countryName", "countryCode", "countryCurrency"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let country = await CountryModel.findOne({
    where: { countryName: body.countryName },
    raw: true,
  });

  if (country) {
    throw new BadRequestError("Country name already exists");
  }

  let filename = "";
  try {
    filename = req.file.filename;
  } catch (error) {}

  if (!filename) {
    throw new BadRequestError("Upload Any Image");
  }

  // if(user.vocationStatus == 'Active' && body.status == 1) {
  //     throw new BadRequestError("Already activated");
  // }
  // if(user.vocationStatus == 'Inactive' && body.status != 1) {
  //     throw new BadRequestError("Already inactivated");
  // }
  let countryStatus = body.countryStatus == 1 ? "Active" : "Inactive";
  let countryData = {
    countryFlagImage: filename,
    countryName: body.countryName,
    countryCode: body.countryCode,
    countryRemarks: body.countryRemarks ? body.countryRemarks : "",
    countryStatus: countryStatus,
    countryShortName: body.countryShortName ? body.countryShortName : "",
    countryCurrency: body.countryCurrency,
  };

  let countryDetail = await CountryModel.create(countryData);
  countryDetail.countryFlagImage =
    config.upload_folder +
    config.upload_entities.country_image_folder +
    countryDetail.countryFlagImage;

  return { slides: countryDetail };
};

let CountryUpdate = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  if (!body.countryName) {
    throw new BadRequestError("Country Name is required");
  }

  let country = await CountryModel.findOne({
    where: { countryID: req.params.countryID },
    raw: true,
  });

  if (!country) {
    throw new BadRequestError("Country doesn't exists");
  }

  let updateData = {};
  let optionalFiled = [
    "countryID",
    "countryName",
    "countryRemarks",
    "countryStatus",
    "countryShortName",
    "countryCurrency",
  ];
  optionalFiled.forEach((x) => {
    if (body[x]) {
      updateData[x] = body[x];
    }
  });
  if (req.file && req.file.path) {
    updateData["countryFlagImage"] = req.file.filename;
  }

  if (body.countryStatus === 0 || body.countryStatus === "0") {
    updateData["countryStatus"] = "Inactive";
  }
  await CountryModel.update(updateData, {
    where: { countryID: req.params.countryID },
    raw: true,
  });
  let countryData = await CountryModel.findOne({
    where: { countryID: req.params.countryID },
    raw: true,
  });
  countryData.countryFlagImage =
    config.upload_folder +
    config.upload_entities.country_image_folder +
    countryData.countryFlagImage;

  return { slides: countryData };
};

let CountryList = async (body) => {
  let limit = body.limit ? parseInt(body.limit) : 10;
  let page = body.page || 1;
  let offset = (page - 1) * limit;
  let findData = { countryStatus: "Active" };
  if (body.filters) {
    if (body.filters.searchtext) {
      findData["$and"] = [
        { countryName: { $like: "%" + body.filters.searchtext + "%" } },
      ];
    }
  }
  if (body.page || body.limit) {
    let allCountry = await countryModel.findAll({
      where: findData,
      limit,
      offset,
      order: [["countryID", "DESC"]],
      raw: true,
    });
    for (let i = 0; i < allCountry.length; i++) {
      allCountry[i].countryFlagImage =
        config.upload_folder +
        config.upload_entities.country_image_folder +
        allCountry[i].countryFlagImage;
    }
    let allCountryCount = await CountryModel.count({
      where: findData,
      order: [["countryID", "DESC"]],
      raw: true,
    });
    let _result = { total_count: 0 };
    _result.slides = allCountry;
    _result.total_count = allCountryCount;
    return _result;
  } else {
    let allCountry = await CountryModel.findAll({
      where: findData,
      order: [["countryID", "DESC"]],
      raw: true,
    });
    for (let i = 0; i < allCountry.length; i++) {
      allCountry[i].countryFlagImage =
        config.upload_folder +
        config.upload_entities.country_image_folder +
        allCountry[i].countryFlagImage;
    }
    let allCountryCount = await CountryModel.count({
      order: [["countryID", "DESC"]],
      raw: true,
    });
    let _result = { total_count: 0 };
    _result.slides = allCountry;
    _result.total_count = allCountryCount;
    return _result;
  }
};

let countryDetail = async (req) => {
  let country = await CountryModel.findOne({
    where: { countryID: req.params.countryID },
    raw: true,
  });

  if (!country) {
    throw new BadRequestError("Country doesn't exists");
  }

  country.countryFlagImage =
    config.upload_folder +
    config.upload_entities.country_image_folder +
    country.countryFlagImage;

  return { slides: country };
};

module.exports = {
  createCountry: createCountry,
  CountryUpdate: CountryUpdate,
  CountryList: CountryList,
  countryDetail,
};
