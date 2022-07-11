"use strict";

let helper = require("../helpers/helpers"),
  _ = require("lodash"),
  md5 = require("md5"),
  config = process.config.global_config,
  CountryModel = require("../models/Country"),
  StateModel = require("../models/State"),
  CityModal = require("../models/City"),
  ReasonsModel = require("../models/Reasons"),
  BadRequestError = require("../errors/badRequestError");

//#region Country

let createCountry = async (req) => {
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let CountryUpdate = async (req) => {
  try {
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
      "countryCode",
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let CountryList = async (req) => {
  try {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let page = req.body.page || 1;
    let offset = (page - 1) * limit;
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let countryDetail = async (req) => {
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let changeCountryStatus = async (req) => {
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//#endregion

//#region State
const createState = async (req) => {
  try {
    let body = req.body.body ? JSON.parse(req.body.body) : req.body;
    if (helper.undefinedOrNull(body)) {
      throw new BadRequestError("Request body comes empty");
    }
    ["stateName", "stateStatus", "countryID"].forEach((x) => {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateState = async (req) => {
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const stateList = async (req) => {
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const stateDetail = async (req) => {
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const changeStateStatus = async (req) => {
  try {
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getStateByCountryID = async (req) => {
  try {
    let state = await StateModel.findAll({
      where: { countryID: req.params.countryID },
      raw: true,
    });

    if (!state) {
      throw new BadRequestError("State doesn't exists");
    }

    return { slides: state };
  } catch (error) {
    console.log(error);
    throw error;
  }
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

//create reasons
let CreateReasons = async (body) => {
  // let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  console.log(body);
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("Request body comes empty");
  }
  ["reasonName"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });

  let user = await ReasonsModel.findOne({
    where: { reasonName: body.reasonName },
    raw: true,
  });

  if (user) {
    throw new BadRequestError("Reason already exists");
  }

  let reasonStatus = body.reasonStatus == 1 ? "Active" : "Inactive";
  let reasonsData = {
    reasonName: body.reasonName,
    reasonStatus: reasonStatus,
  };
  await ReasonsModel.create(reasonsData);
  return { slides: "Reason created successfully" };
};

//get reasons

let GetReasons = async (body) => {
  try {
    let limit = body.limit ? parseInt(body.limit) : 10;
    let page = body.page || 1;
    let offset = (page - 1) * limit;
    let allUser = await ReasonsModel.findAll({
      limit,
      offset,
      order: [["reasonID", "DESC"]],
      raw: true,
    });
    let allUserCount = await ReasonsModel.count({
      order: [["reasonID", "DESC"]],
      raw: true,
    });
    let _result = { total_count: 0 };
    _result.slides = allUser;
    _result.total_count = allUserCount;
    return _result;
  } catch (err) {
    console.log(err);
  }
};

//update reasons

let ReasonsUpdate = async (req) => {
  let body = req.body.body ? JSON.parse(req.body.body) : req.body;
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }
  ["reasonName"].forEach((x) => {
    if (!body[x]) {
      throw new BadRequestError(x + " is required");
    }
  });
  let updateData = {};
  let optionalFiled = ["reasonName", "reasonStatus"];
  optionalFiled.forEach((x) => {
    if (body[x]) {
      updateData[x] = body[x];
    }
  });
  await ReasonsModel.update(updateData, {
    where: { reasonID: req.params.reasonID },
    raw: true,
  });
  let industry = await ReasonsModel.findOne({
    where: { reasonID: req.params.reasonID },
    raw: true,
  });

  return { slides: industry };
};

//get detail

let ReasonDetail = async (req) => {
  if (!req.params.reasonID) {
    throw new BadRequestError("reasonID is required");
  }
  let ReasonData = await ReasonsModel.findOne({
    where: { reasonID: req.params.reasonID },
    raw: true,
  });
  return { slides: ReasonData };
};

//change status
let ChangeReasonStatus = async (body) => {
  if (helper.undefinedOrNull(body)) {
    throw new BadRequestError("body_empty");
  }

  if (helper.undefinedOrNull(body.reasonID)) {
    throw new BadRequestError("reasonID is required");
  }
  if (helper.undefinedOrNull(body.status)) {
    throw new BadRequestError("Status is required");
  }

  let reason = await ReasonsModel.findOne({
    where: { reasonID: body.reasonID },
    raw: true,
  });
  if (!reason) {
    throw new BadRequestError("Provided reason is not available");
  }
  if (reason.reasonStatus == "Active" && body.status == 1) {
    throw new BadRequestError("Reason is Already activated");
  }
  if (reason.reasonStatus == "Inactive" && body.status != 1) {
    throw new BadRequestError("Reason is Already inactivated");
  }
  let status = body.status == 1 ? "Active" : "Inactive";
  await ReasonsModel.update(
    { reasonStatus: status },
    { where: { reasonID: reason.reasonID }, raw: true }
  );
  return { status: body.status };
};

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
  CreateReasons: CreateReasons,
  GetReasons: GetReasons,
  ReasonsUpdate: ReasonsUpdate,
  ReasonDetail: ReasonDetail,
  ChangeReasonStatus: ChangeReasonStatus,
};
