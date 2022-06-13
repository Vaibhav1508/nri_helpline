

 let vocationManager = require('../manager/Vocation');

  /**
 * @swagger
 * /api/v1/vocation/createvocation:
 *   post:
 *     summary: create vocation.
 *     tags:
 *      - Vocation
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
 let CreateVocation = (req, res, next) => {
     return vocationManager
         .CreateVocation(req)
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
 * /api/v1/vocation/createsubvocation:
 *   post:
 *     summary: create sub vocation.
 *     tags:
 *      - Vocation
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vocationID:
 *                 type: string
 *                 example: 1
 *                 paramType: body
 *               subVocationName:
 *                 type: string
 *                 example: aavvcc
 *                 paramType: body
 *               subVocationImage:
 *                 type: file
 *                 example: ''
 *               subVocationRemarks:
 *                 type: string
 *                 example: aavvcc
 *                 paramType: body
 *               subVocationStatus:
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
let CreateSubVocation = (req, res, next) => {
    return vocationManager
        .CreateSubVocation(req)
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
 * /api/v1/vocation/userselectvocation:
 *   post:
 *     summary: Select User Vocation.
 *     tags:
 *      - Vocation
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
 *                 type: number
 *                 example: 1
 *                 paramType: body
 *               vocationID:
 *                 type: array
 *                 example: [1,2,3]
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
let UserSelectVocation = (req, res, next) => {
    return vocationManager
        .UserSelectVocation(req.body)
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
 * /api/v1/vocation/vocationslist:
 *   post:
 *     summary: vocations List.
 *     tags:
 *      - Vocation
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
 *                 type: string
 *                 example: 1
 *                 paramType: body
 *               limit:
 *                 type: string
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
let VocationsList = (req, res, next) => {
    return vocationManager
        .VocationsList(req.body)
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
 * /api/v1/vocation/adminvocationslist:
 *   post:
 *     summary: vocations List.
 *     tags:
 *      - Vocation
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
 *                 type: string
 *                 example: 1
 *                 paramType: body
 *               limit:
 *                 type: string
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
let AdminVocationsList = (req, res, next) => {
    return vocationManager
        .AdminVocationsList(req.body)
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
 * /api/v1/vocation/getsuggetion:
 *   post:
 *     summary: get suggetion from selected vocations List.
 *     tags:
 *      - Vocation
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
 *                 type: string
 *                 example: 1
 *                 paramType: body
 *               limit:
 *                 type: string
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
let GetSuggetion = (req, res, next) => {
    return vocationManager
        .GetSuggetion(req.body)
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
 * /api/v1/vocation/subvocationslist:
 *   post:
 *     summary: subvocations List.
 *     tags:
 *      - Vocation
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
 *                 type: string
 *                 example: 1
 *                 paramType: body
 *               limit:
 *                 type: string
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
let SubVocationsList = (req, res, next) => {
    return vocationManager
        .SubVocationsList(req.body)
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
 * /api/v1/vocation/adminsubvocationslist:
 *   post:
 *     summary: subvocations List.
 *     tags:
 *      - Vocation
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
 *                 type: string
 *                 example: 1
 *                 paramType: body
 *               limit:
 *                 type: string
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
let AdminSubVocationsList = (req, res, next) => {
    return vocationManager
        .AdminSubVocationsList(req.body)
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
 * /api/v1/vocation/changevocationstatus:
 *   post:
 *     summary: Change Vocation Status.
 *     tags:
 *      - Vocation
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
 *               vocationID:
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
let ChangeVocationStatus = (req, res, next) => {
    return vocationManager
        .ChangeVocationStatus(req.body)
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
 * /api/v1/vocation/changesubvocationstatus:
 *   post:
 *     summary: Change Subvocation Status.
 *     tags:
 *      - Vocation
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
 *               subVocationID:
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
let ChangeSubVocationStatus = (req, res, next) => {
    return vocationManager
        .ChangeSubVocationStatus(req.body)
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
 * /api/v1/vocation/vocationdetail/:vocationID:
 *   post:
 *     summary: Vocation Detail.
 *     tags:
 *      - Vocation
 *     parameters :
 *     - name: x-auth-api-key
 *       in: header   
 *       description: an authorization header
 *       required: true
 *       type: string 
 *     - name: vocationID
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
let VocationDetail = (req, res, next) => {
    return vocationManager
        .VocationDetail(req)
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
 * /api/v1/vocation/subvocationdetail/:vocationID:
 *   post:
 *     summary: Sub Vocation Detail.
 *     tags:
 *      - Vocation
 *     parameters :
 *     - name: x-auth-api-key
 *       in: header   
 *       description: an authorization header
 *       required: true
 *       type: string 
 *     - name: vocationID
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
let SubVocationDetail = (req, res, next) => {
    return vocationManager
        .SubVocationDetail(req)
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
let VocationUpdate = (req, res, next) => {
    return vocationManager
        .VocationUpdate(req)
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
 * /api/v1/Admin/subvocation-update/:vocationID:
 *   put:
 *     summary: Sub Vocation Update.
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
let SubVocationUpdate = (req, res, next) => {
    return vocationManager
        .SubVocationUpdate(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}
 
 module.exports = {
    AdminVocationsList:AdminVocationsList,
    AdminSubVocationsList:AdminSubVocationsList,
    CreateVocation: CreateVocation,
    VocationsList : VocationsList,
    ChangeVocationStatus:ChangeVocationStatus,
    UserSelectVocation : UserSelectVocation,
    CreateSubVocation: CreateSubVocation,
    SubVocationsList: SubVocationsList,
    ChangeSubVocationStatus: ChangeSubVocationStatus,
    VocationDetail:VocationDetail,
    SubVocationDetail:SubVocationDetail,
    VocationUpdate:VocationUpdate,
    SubVocationUpdate: SubVocationUpdate,
    GetSuggetion:GetSuggetion
 };