'use strict';

let AccessDeniedError = require('../errors/accessDeniedError');
let CustomQueryModel = require("../models/Custom_query");
let SequelizeObj = require("sequelize");



let isValidUser = (req,res,next)=>{
    let auth_token = req.get("x-auth-token");
    
    let sqlQuery = 'select id,username from users where isactive=1 and id=\
                    (select userid from users_auth where token=:auth_token limit 1) limit 1;'
                   
    CustomQueryModel
    .query(sqlQuery,{
      replacements: {
          'auth_token' : auth_token
        },
        type: SequelizeObj.QueryTypes.SELECT,
        raw:true
      })
      .then(user =>{
        if(!user || user.length == 0){
          throw new AccessDeniedError("You are not authorized to access api ");
        } else {          
          req.user = {
            userId: user[0].id,
            userName: user[0].username
          };

          next();
        }
      })
      .catch(error => {
        next(error);
      })
}
let isValidAdmin = (req,res,next)=>{
  let auth_token = req.get('x-auth-token');    
    let sqlQuery = 'select id from admin_master where token=:auth_token limit 1;'
    
    CustomQueryModel
    .query(sqlQuery,{
      replacements: {
          'auth_token' : auth_token
        },
        type: SequelizeObj.QueryTypes.SELECT,
        raw:true
      })
      .then(merchant =>{        
        if(!merchant || merchant.length == 0){
          throw new AccessDeniedError("You are not authorized to access api ");
        } else {          
          req.admin = {
            adminid: merchant[0].id
          };
          next();
        }
      })
      .catch(error => {
        next(error);
      })
}
module.exports = {
  isValidAdmin: isValidAdmin,
  isValidUser: isValidUser,
};


