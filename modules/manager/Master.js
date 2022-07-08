"use strict";

let helper = require("../helpers/helpers"),
  _ = require("lodash"),
  md5 = require("md5"),
  config = process.config.global_config,
  CountryModel = require("../models/Country"),
  StateModel = require("../models/State"),
  CityModal = require("../models/City"),
  BadRequestError = require("../errors/badRequestError");

//#region Country

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
  // let countryStatus = body.countryStatus == 1 ? "Active" : "Inactive";
  let countryData = {
    countryFlagImage: filename,
    countryName: body.countryName,
    countryCode: body.countryCode,
    countryRemarks: body.countryRemarks ? body.countryRemarks : "",
    countryStatus: body.countryStatus,
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

  // if (body.countryStatus === 0 || body.countryStatus === "0") {
  //   updateData["countryStatus"] = "Inactive";
  // }
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

let CountryList = async (req) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let page = req.body.page || 1;
  let offset = (page - 1) * limit;
  // let findData = { countryStatus: "Active" };
  let findData = {};
  if (req.body.filters) {
    if (req.body.filters.searchtext) {
      findData["$and"] = [
        { countryName: { $like: "%" + req.body.filters.searchtext + "%" } },
      ];
    }
  }
  if (req.body.page || req.body.limit) {
    let allCountry = await CountryModel.findAll({
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

let changeCountryStatus = async (req) => {
  let country = await CountryModel.findOne({
    where: { countryID: req.body.countryID },
    raw: true,
  });

  if (!country) {
    throw new BadRequestError("Country doesn't exists");
  }

  await CountryModel.update(
    { countryStatus: req.body.countryStatus },
    { where: { countryID: req.body.countryID } }
  );
  return {
    status: req.body.countryStatus,
  };
};

//#endregion

//#region State
const createState = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["stateName", "stateCode", "stateStatus", "countryID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let stateData = {
    stateName: body.stateName,
    stateCode: body.stateCode,
    stateStatus: body.stateStatus,
    stateRemarks: body.stateRemarks,
    countryID: body.countryID,
  };

  let state = await StateModel.create(stateData);
  return { state };
};

const updateState = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  if (!body.stateName) {
    throw new BadRequestError("State Name is required");
  }

  let state = await StateModel.findOne({
    where: { stateID: req.params.stateID },
    raw: true,
  });

  if (!state) {
    throw new BadRequestError("State doesn't exists");
  }

  let updateData = {};
  let optionalFiled = [
    "stateID",
    "stateName",
    "stateRemarks",
    "stateStatus",
    "countryID",
  ];
  optionalFiled.forEach((x) => {
    if (body[x]) {
      updateData[x] = body[x];
    }
  });

  await StateModel.update(updateData, {
    where: { stateID: req.params.stateID },
    raw: true,
  });
  let stateData = await StateModel.findOne({
    where: { stateID: req.params.stateID },
    raw: true,
  });

  return { stateData };
};

const stateList = async (req) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let page = req.body.page || 1;
  let offset = (page - 1) * limit;
  let findData = {};
  if (req.body.filters) {
    if (req.body.filters.searchtext) {
      findData["$and"] = [
        { stateName: { $like: "%" + req.body.filters.searchtext + "%" } },
      ];
    }
  }
  if (req.body.page || req.body.limit) {
    let allState = await StateModel.findAll({
      where: findData,
      limit,
      offset,
      order: [["stateID", "ASC"]],
      raw: true,
    });

    // country Name for all State
    let countryName = await CountryModel.findAll({});

    for (let i = 0; i < allState.length; i++) {
      allState[i].countryName = countryName.find(
        (x) => x.countryID == allState[i].countryID
      ).countryName;
    }

    let allStateCount = await StateModel.count({
      where: findData,
      order: [["stateID", "ASC"]],
      raw: true,
    });
    let _result = { total_count: 0 };
    _result.slides = allState;
    _result.total_count = allStateCount;
    return _result;
  } else {
    let allState = await StateModel.findAll({
      where: findData,
      order: [["stateID", "ASC"]],
      raw: true,
    });

    let countryName = await CountryModel.findAll({});

    for (let i = 0; i < allState.length; i++) {
      allState[i].countryName = countryName.find(
        (x) => x.countryID == allState[i].countryID
      ).countryName;
    }

    let allStateCount = await StateModel.count({
      order: [["stateID", "ASC"]],
      raw: true,
    });
    let _result = { total_count: 0 };
    _result.slides = allState;
    _result.total_count = allStateCount;
    return _result;
  }
};

const stateDetail = async (req) => {
  let state = await StateModel.findOne({
    where: { stateID: req.params.stateID },
    raw: true,
  });

  if (!state) {
    throw new BadRequestError("State doesn't exists");
  }

  let countryName = await CountryModel.findOne({
    where: { countryID: state.countryID },
    raw: true,
  });

  state.countryName = countryName.countryName;
  return { slides: state };
};

const changeStateStatus = async (req) => {
  let state = await StateModel.findOne({
    where: { stateID: req.body.stateID },
    raw: true,
  });

  if (!state) {
    throw new BadRequestError("State doesn't exists");
  }

  await StateModel.update(
    { stateStatus: req.body.stateStatus },
    { where: { stateID: req.body.stateID } }
  );
  return {
    status: req.body.stateStatus,
  };
};

const getStateByCountryID = async (req) => {
  let state = await StateModel.findAll({
    where: { countryID: req.params.countryID },
    raw: true,
  });

  if (!state) {
    throw new BadRequestError("State doesn't exists");
  }

  return { slides: state };
};

//#endregion

//#region City

const createCity = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["cityName", "countryID", "cityStatus", "stateID"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let cityData = {
    cityName: body.cityName,
    cityStatus: body.cityStatus,
    cityRemarks: body.cityRemarks ? body.cityRemarks : "",
    countryID: body.countryID,
    stateID: body.stateID,
  };

  let city = await CityModal.create(cityData);
  return { city };
};

const updateCity = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  if (!body.cityName) {
    throw new BadRequestError("City Name is required");
  }

  let city = await CityModal.findOne({
    where: { cityID: req.params.cityID },
    raw: true,
  });

  if (!city) {
    throw new BadRequestError("City doesn't exists");
  }

  let updateData = {};
  let optionalFiled = [
    "cityID",
    "cityName",
    "cityRemarks",
    "cityStatus",
    "countryID",
    "stateID",
  ];
  optionalFiled.forEach((x) => {
    if (body[x]) {
      updateData[x] = body[x];
    }
  });

  await CityModal.update(updateData, {
    where: { cityID: req.params.cityID },
    raw: true,
  });
  let cityData = await CityModal.findOne({
    where: { cityID: req.params.cityID },
    raw: true,
  });

  return { cityData };
};

const cityList = async (req) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let page = req.body.page || 1;
  let offset = (page - 1) * limit;
  let findData = {};
  if (req.body.filters) {
    if (req.body.filters.searchtext) {
      findData["$and"] = [
        { cityName: { $like: "%" + req.body.filters.searchtext + "%" } },
      ];
    }
  }
  if (req.body.page || req.body.limit) {
    let allCity = await CityModal.findAll({
      where: findData,
      limit,
      offset,
      order: [["cityID", "ASC"]],
      raw: true,
    });

    // country Name for all City
    let countryName = await CountryModel.findAll({});

    // state Name for all City
    let stateName = await StateModel.findAll({});

    for (let i = 0; i < allCity.length; i++) {
      allCity[i].countryName = countryName.find(
        (x) => x.countryID == allCity[i].countryID
      ).countryName;
    }

    for (let i = 0; i < allCity.length; i++) {
      allCity[i].stateName = stateName.find(
        (x) => x.stateID == allCity[i].stateID
      ).stateName;
    }

    let allCityCount = await CityModal.count({
      where: findData,
      order: [["cityID", "ASC"]],
      raw: true,
    });
    let _result = { total_count: 0 };
    _result.slides = allCity;
    _result.total_count = allCityCount;
    return _result;
  } else {
    let allCity = await CityModal.findAll({
      where: findData,
      order: [["cityID", "ASC"]],
      raw: true,
    });

    let countryName = await CountryModel.findAll({});

    let stateName = await StateModel.findAll({});

    for (let i = 0; i < allCity.length; i++) {
      allCity[i].countryName = countryName.find(
        (x) => x.countryID == allCity[i].countryID
      ).countryName;
    }

    for (let i = 0; i < allCity.length; i++) {
      allCity[i].stateName = stateName.find(
        (x) => x.stateID == allCity[i].stateID
      ).stateName;
    }

    let allCityCount = await CityModal.count({
      where: findData,
      order: [["cityID", "ASC"]],
      raw: true,
    });
    let _result = { total_count: 0 };
    _result.slides = allCity;
    _result.total_count = allCityCount;
    return _result;
  }
};

const cityDetail = async (req) => {
  let city = await CityModal.findOne({
    where: { cityID: req.params.cityID },
    raw: true,
  });

  if (!city) {
    throw new BadRequestError("City doesn't exists");
  }

  let countryName = await CountryModel.findOne({
    where: { countryID: city.countryID },
    raw: true,
  });

  let stateName = await StateModel.findOne({
    where: { stateID: city.stateID },
    raw: true,
  });

  city.countryName = countryName.countryName;
  city.stateName = stateName.stateName;
  return { slides: city };
};

const changeCityStatus = async (req) => {
  let city = await CityModal.findOne({
    where: { cityID: req.body.cityID },
    raw: true,
  });

  if (!city) {
    throw new BadRequestError("City doesn't exists");
  }

  await CityModal.update(
    { cityStatus: req.body.cityStatus },
    { where: { cityID: req.body.cityID } }
  );
  return {
    status: req.body.cityStatus,
  };
};

const getCityByStateID = async (req) => {
  let city = await CityModal.findAll({
    where: { stateID: req.params.stateID },
    raw: true,
  });

  if (!city) {
    throw new BadRequestError("City doesn't exists");
  }

  return { slides: city };
};

//#endregion

module.exports = {
  createCountry: createCountry,
  CountryUpdate: CountryUpdate,
  CountryList: CountryList,
  countryDetail,
  changeCountryStatus,
  createState,
  updateState,
  stateList,
  stateDetail,
  changeStateStatus,
  getStateByCountryID,
  createCity,
  updateCity,
  cityList,
  cityDetail,
  changeCityStatus,
  getCityByStateID,
};
