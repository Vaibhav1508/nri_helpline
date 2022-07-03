let questionManager = require('../manager/Question');

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
let CreateQuestion = (req, res, next) => {
   return questionManager
       .CreateQuestion(req)
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
 * /api/v1/vocation/QuestionList:
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
let QuestionList = (req, res, next) => {
    return questionManager
        .QuestionList(req.body)
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
 * /api/v1/vocation/QuestionList:
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
let QuestionLike = (req, res, next) => {
    return questionManager
        .QuestionLike(req)
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
 * /api/v1/vocation/QuestionList:
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
let QuestionUnlike = (req, res, next) => {
    return questionManager
        .QuestionUnlike(req)
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
 * /api/v1/vocation/QuestionList:
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
let QuestionsAnswer = (req, res, next) => {
    return questionManager
        .QuestionsAnswer(req)
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
 * /api/v1/vocation/QuestionList:
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
let MyQuestionList = (req, res, next) => {
    return questionManager
        .MyQuestionList(req.body)
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
 * /api/v1/vocation/QuestionList:
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
let QuestionsComment = (req, res, next) => {
    return questionManager
        .QuestionsComment(req)
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
 * /api/v1/vocation/QuestionList:
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
let QuestionsBookmark = (req, res, next) => {
    return questionManager
        .QuestionsBookmark(req)
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
 * /api/v1/vocation/QuestionList:
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
let QuestionsUnBookmark = (req, res, next) => {
    return questionManager
        .QuestionsUnBookmark(req)
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
    CreateQuestion: CreateQuestion,
    QuestionList:QuestionList,
    MyQuestionList:MyQuestionList,
    QuestionLike: QuestionLike,
    QuestionUnlike:QuestionUnlike,
    QuestionsAnswer: QuestionsAnswer,
    QuestionsComment:QuestionsComment,
    QuestionsBookmark:QuestionsBookmark,
    QuestionsUnBookmark:QuestionsUnBookmark
 };