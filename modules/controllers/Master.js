let masterManager = require("../manager/Master");

//#region Country

/**
 * @swagger
 * /api/v1/User/user-update/:userID:
 *   put:
 *     summary: User Update.
 *     tags:
 *      - Web User
 *     parameters :
 *     - name: x-auth-api-key
 *       in: header
 *       description: an authorization header
 *       required: true
 *       type: string
 *     - name: userID
 *       in: header
 *       description: an authorization header
 *       required: true
 *       type: string
 *     - name: Accept-Language
 *       in: header
 *       description: Language
 *       required: false
 *       type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userFirstName:
 *                 type: string
 *                 example: johm Smith
 *                 paramType: body
 *               userLastName:
 *                 type: string
 *                 example: johm Smith
 *                 paramType: body
 *               industryID:
 *                 type: number
 *                 example: 9377690348
 *                 paramType: body
 *               userJobDescription:
 *                 type: string
 *                 example: johm Smith
 *                 paramType: body
 *     responses:
 *       200:
 *         description: user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       400:
 *         description: error in request processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 400
 */
let createCountry = (req, res, next) => {
  return masterManager
    .createCountry(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

/**
 * @swagger
 * /api/v1/Admin/vocation-update/:vocationID:
 *   put:
 *     summary: Vocation Update.
 *     tags:
 *      - Vocation
 *     parameters :
 *     - name: x-auth-api-key
 *       in: header
 *       description: an authorization header
 *       required: true
 *       type: string
 *     - name: userID
 *       in: header
 *       description: an authorization header
 *       required: true
 *       type: string
 *     - name: Accept-Language
 *       in: header
 *       description: Language
 *       required: false
 *       type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vocationName:
 *                 type: string
 *                 example: aavvcc
 *                 paramType: body
 *               vocationImage:
 *                 type: file
 *                 example: ''
 *               vocationRemarks:
 *                 type: string
 *                 example: aavvcc
 *                 paramType: body
 *               vocationStatus:
 *                 type: integer
 *                 example: aavvcc
 *                 paramType: body
 *     responses:
 *       200:
 *         description: user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       400:
 *         description: error in request processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 400
 */
let CountryUpdate = (req, res, next) => {
  return masterManager
    .CountryUpdate(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let CountryList = (req, res, next) => {
  return masterManager
    .CountryList(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let countryDetail = (req, res, next) => {
  return masterManager
    .countryDetail(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const changeCountryStatus = (req, res, next) => {
  return masterManager
    .changeCountryStatus(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

//#endregion

//#region State
const createState = (req, res, next) => {
  return masterManager
    .createState(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const updateState = (req, res, next) => {
  return masterManager
    .updateState(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const stateList = (req, res, next) => {
  return masterManager
    .stateList(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const stateDetail = (req, res, next) => {
  return masterManager
    .stateDetail(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const changeStateStatus = (req, res, next) => {
  return masterManager
    .changeStateStatus(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const getStateByCountryID = (req, res, next) => {
  return masterManager
    .getStateByCountryID(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

//#endregion

//#region City
const createCity = (req, res, next) => {
  return masterManager
    .createCity(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const updateCity = (req, res, next) => {
  return masterManager
    .updateCity(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const cityList = (req, res, next) => {
  return masterManager
    .cityList(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const cityDetail = (req, res, next) => {
  return masterManager
    .cityDetail(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const changeCityStatus = (req, res, next) => {
  return masterManager
    .changeCityStatus(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const getCityByStateID = (req, res, next) => {
  return masterManager
    .getCityByStateID(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

//#endregion

module.exports = {
  createCountry: createCountry,
  CountryUpdate: CountryUpdate,
  CountryList,
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
