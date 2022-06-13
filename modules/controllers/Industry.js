

 let IndustryManager = require('../manager/Industry');

  /**
 * @swagger
 * /api/v1/Industry/addindustry:
 *   post:
 *     summary: create industry.
 *     tags:
 *      - Industry
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
 *               industryName:
 *                 type: string
 *                 example: aavvcc
 *                 paramType: body
 *               industryRemarks:
 *                 type: string
 *                 example: aavvcc
 *                 paramType: body
 *               industryStatus:
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
 let CreateIndustry = (req, res, next) => {
     return IndustryManager
         .CreateIndustry(req.body)
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
 * /api/v1/Industry/getindustry:
 *   post:
 *     summary: get industry.
 *     tags:
 *      - Industry
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
let GetIndustry = (req, res, next) => {
    return IndustryManager
        .GetIndustry(req.body)
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
 * /api/v1/Industry/getwebindustry:
 *   post:
 *     summary: get web industry.
 *     tags:
 *      - Industry
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
let GetWebIndustry = (req, res, next) => {
    return IndustryManager
        .GetWebIndustry(req.body)
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
 * /api/v1/Industry/industrydetail/:industryID:
 *   post:
 *     summary: Industry Detail.
 *     tags:
 *      - Industry
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
let IndustryDetail = (req, res, next) => {
    return IndustryManager
        .IndustryDetail(req)
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
 * /api/v1/Industry/changeindustrystatus:
 *   post:
 *     summary: Change Industry Status.
 *     tags:
 *      - Industry
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
 *               industryID:
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
let ChangeIndustryStatus = (req, res, next) => {
    return IndustryManager
        .ChangeIndustryStatus(req.body)
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
 * /api/v1/Industry/industry-update/:industryID:
 *   put:
 *     summary: Industry Update.
 *     tags:
 *      - Industry
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
 *               industryName:
 *                 type: string
 *                 example: johm Smith
 *                 paramType: body
 *               industryRemarks:
 *                 type: string
 *                 example: johm Smith
 *                 paramType: body
 *               industryStatus:
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
let IndustryUpdate = (req, res, next) => {
    return IndustryManager
        .IndustryUpdate(req)
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
    CreateIndustry: CreateIndustry,
    GetIndustry : GetIndustry,
    GetWebIndustry : GetWebIndustry,
    ChangeIndustryStatus : ChangeIndustryStatus,
    IndustryDetail:IndustryDetail,
    IndustryUpdate:IndustryUpdate
 };