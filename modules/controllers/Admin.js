

 let adminManager = require('../manager/Admin');

  /**
 * @swagger
 * /api/v1/Admin/login:
 *   post:
 *     summary: Admin login.
 *     tags:
 *      - Admin Login
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
     return adminManager
         .Login(req.body)
         .then(data => {
             let result = {
                 status:200,
                 data: data
             }
             return res.json(result);
         })
         .catch(next);
 } 

  /**
 * @swagger
 * /api/v1/Admin/userslist:
 *   post:
 *     summary: User List.
 *     tags:
 *      - Admin User Management
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
 *               page:
 *                 type: integer
 *                 example: 1
 *                 paramType: body
 *               limit:
 *                 type: integer
 *                 example: 2
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
let UsersList = (req, res, next) => {
    return adminManager
        .UsersList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

  /**
 * @swagger
 * /api/v1/Admin/user/:userID:
 *   post:
 *     summary: User Detail.
 *     tags:
 *      - Admin User Management
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
let UsersDetail = (req, res, next) => {
    return adminManager
        .UsersDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

 /**
 * @swagger
 * /api/v1/Admin/user-update/:userID:
 *   put:
 *     summary: User Update.
 *     tags:
 *      - Admin User Management
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
let UserUpdate = (req, res, next) => {
    return adminManager
        .UserUpdate(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 


  /**
 * @swagger
 * /api/v1/Admin/changeusersatus:
 *   post:
 *     summary: Change User Status.
 *     tags:
 *      - Admin User Management
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
 *               userID:
 *                 type: string
 *                 example: 1
 *                 paramType: body
 *               status:
 *                 type: number
 *                 example: 0
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
let ChangeUserStatus = (req, res, next) => {
    return adminManager
        .ChangeUserStatus(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

 

 let changePassword = (req, res, next) => {
    let adminid = req.admin ? req.admin.adminid : null;
    return adminManager
        .changePassword(adminid,req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 
 
 let signout = (req,res,next) => {
     let adminid = req.admin ? req.admin.adminid : null;
     let authToken = req.get('x-auth-token');
 
     return adminManager
         .signout(adminid,authToken)
         .then(data => {
             let result = {
                 status:200
             }
             return res.json(result);
         })
         .catch(next);
 }
 
 
 
 module.exports = {
    Login           : Login,  
    changePassword:changePassword, 
    signout          : signout,
    UsersList : UsersList,
    UsersDetail:UsersDetail,
    UserUpdate:UserUpdate,
    ChangeUserStatus : ChangeUserStatus
 };