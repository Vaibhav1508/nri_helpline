let userManager = require("../manager/Users");

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: login.
 *     tags:
 *      - Login/Register
 *     parameters :
 *     - name: x-auth-api-key
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
 *               userEmail:
 *                 type: string
 *                 example: test@gmail.com
 *                 paramType: body
 *               userPassword:
 *                 type: string
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
let Login = (req, res, next) => {
  return userManager
    .Login(req.body)
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
 * /api/v1/auth/register:
 *   post:
 *     summary: register.
 *     tags:
 *      - Login/Register
 *     parameters :
 *     - name: x-auth-api-key
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
 *               userEmail:
 *                 type: string
 *                 example: test@gmail.com
 *                 paramType: body
 *               userPassword :
 *                 type: string
 *                 example: aavvcc
 *                 paramType: body
 *               userMobile:
 *                 type: string
 *                 example: 9377690348
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
let register = (req, res, next) => {
  return userManager
    .register(req.body)
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
 * /api/v1/auth/verifyotp:
 *   post:
 *     summary: verifyotp.
 *     tags:
 *      - Login/Register
 *     parameters :
 *     - name: x-auth-api-key
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
 *               userEmail:
 *                 type: string
 *                 example: test@gmail.com
 *                 paramType: body
 *               otp :
 *                 type: string
 *                 example: 123456
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
let VerifyOtp = (req, res, next) => {
  return userManager
    .VerifyOtp(req.body)
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
 * /api/v1/auth/resendotp:
 *   post:
 *     summary: resendotp.
 *     tags:
 *      - Login/Register
 *     parameters :
 *     - name: x-auth-api-key
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
 *               userEmail:
 *                 type: string
 *                 example: test@gmail.com
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
let ResendOtp = (req, res, next) => {
  return userManager
    .ResendOtp(req.body)
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
 * /api/v1/auth/forgetpassword:
 *   post:
 *     summary: forgetpassword.
 *     tags:
 *      - Login/Register
 *     parameters :
 *     - name: x-auth-api-key
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
 *               userEmail:
 *                 type: string
 *                 example: test@gmail.com
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
let ForgetPassword = (req, res, next) => {
  return userManager
    .ForgetPassword(req.body)
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
 * /api/v1/auth/setnewpassword:
 *   post:
 *     summary: setnewpassword.
 *     tags:
 *      - Login/Register
 *     parameters :
 *     - name: x-auth-api-key
 *       in: header
 *       description: an authorization header
 *       required: true
 *       type: string
 *     - name: token
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
 *               userEmail:
 *                 type: string
 *                 example: test@gmail.com
 *                 paramType: body
 *               userPassword:
 *                 type: string
 *                 example: test@gmail.com
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
let SetNewPassword = (req, res, next) => {
  return userManager
    .SetNewPassword(req)
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
 * /api/v1/User/profilesetup:
 *   post:
 *     summary: profilesetup.
 *     tags:
 *      - User
 *     parameters :
 *     - name: x-auth-api-key
 *       in: header
 *       description: an authorization header
 *       required: true
 *       type: string
 *     - name: token
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
 *               vocationID:
 *                 type: string
 *                 example: ['1','2']
 *                 paramType: body
 *               subVocationIDs:
 *                 type: string
 *                 example: ['1','2']
 *                 paramType: body
 *               userOtherDetails:
 *                 type: string
 *                 example: ['1','2']
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
let ProfileSetup = (req, res, next) => {
  return userManager
    .ProfileSetup(req.body)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let changePassword = (req, res, next) => {
  let adminid = req.admin ? req.admin.adminid : null;
  return userManager
    .changePassword(adminid, req.body)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let signout = (req, res, next) => {
  let adminid = req.admin ? req.admin.adminid : null;
  let authToken = req.get("x-auth-token");

  return userManager
    .signout(adminid, authToken)
    .then((data) => {
      let result = {
        status: 200,
      };
      return res.json(result);
    })
    .catch(next);
};

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
let UserUpdate = (req, res, next) => {
  return userManager
    .UserUpdate(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let CompanyDetails = (req, res, next) => {
  return userManager
    .CompanyDetails(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let UpdateCompanyDetails = (req, res, next) => {
  return userManager
    .updateCompanyDetails(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let getUserFollowers = (req, res, next) => {
  return userManager
    .getUserFollowers(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const unfollowUser = (req, res, next) => {
  return userManager
    .unfollowUser(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const followUser = (req, res, next) => {
  return userManager
    .followUser(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const userVocationFollowList = (req, res, next) => {
  return userManager
    .userVocationFollowList(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const unFollowVocation = (req, res, next) => {
  return userManager
    .unFollowVocation(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

const followVocation = (req, res, next) => {
  return userManager
    .followVocation(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

module.exports = {
  Login: Login,
  changePassword: changePassword,
  signout: signout,
  register: register,
  VerifyOtp: VerifyOtp,
  ResendOtp: ResendOtp,
  ForgetPassword: ForgetPassword,
  SetNewPassword: SetNewPassword,
  ProfileSetup: ProfileSetup,
  UserUpdate: UserUpdate,
  CompanyDetails,
  UpdateCompanyDetails,
  getUserFollowers,
  unfollowUser,
  followUser,
  userVocationFollowList,
  unFollowVocation,
  followVocation,
};
