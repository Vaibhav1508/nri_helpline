'use strict';

let AccessDeniedError = require('../errors/accessDeniedError');
let CustomQueryModel = require("../models/Custom_query");
let SequelizeObj = require("sequelize");
const moment = require('moment');

let isValidUser = (req,res,next)=>{
    let auth_token = req.get("x-auth-token");
    
    let sqlQuery = 'select id,v_full_name from tbl_users where e_status="Active" and v_api_token=:auth_token limit 1;'
                   
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
          throw new AccessDeniedError("Your are no longer have access to this account as your account is deleted from our database.");
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
    let sqlQuery = 'select id,i_admin_id,expire_time from tbl_superadmin_tokens where v_token=:auth_token AND expire_time >= NOW() limit 1;'
    
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
          // Set the timezone you want to use (for example, 'UTC' or 'America/New_York')
          const timezone = 'UTC'; // Change this to your desired timezone
          // Get the current date and time in the specified timezone
          const currentDateTime = moment().tz(timezone);
          // Add 2 hours to the current date and time
          const expireTime = currentDateTime.add(2, 'hours').format('YYYY-MM-DD HH:mm:ss');
          let sqlQuery = 'UPDATE tbl_superadmin_tokens SET expire_time=:exp_time WHERE id=:token_id;'
          CustomQueryModel
          .query(sqlQuery,{
            replacements: {
              'exp_time' : expireTime,
              'token_id' : merchant[0].id
            },
            type: SequelizeObj.QueryTypes.UPDATE,
            raw:true
          }).then(child =>{
            console.log("Token Updated")
          })
          req.admin = {
            admin_token_id: merchant[0].id,
            adminid: merchant[0].i_admin_id
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


