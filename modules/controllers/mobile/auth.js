let authManager = require("../../manager/mobile/auth");

let SendOtp = (req, res, next) => {
    return authManager
        .SendOtp(req.body,req)
        .then(data => {
          let result = data.status ? {
            status: data.status,
            message: data.message,
          } :{
            status: 200,
            data: data,
          };
            return res.json(result);
        })
        .catch(next);
} 

let VerifyOtp = (req, res, next) => {
  let body = req.body
  return authManager
    .VerifyOtp(body, req)
    .then((data) => {
      let result = data.status ? {
        status: data.status,
        message: data.message,
      } :{
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let UpdateProfile = (req, res, next) => {
  let body = req.body
  return authManager
    .UpdateProfile(body, req)
    .then((data) => {
      let result = data.status ? {
        status: data.status,
        message: data.message,
      } :{
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let ProfileDetail = (req, res, next) => {
  let body = req.body
  return authManager
    .ProfileDetail(body, req)
    .then((data) => {
      let result = data.status ? {
        status: data.status,
        message: data.message,
      } :{
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let ProfessionList = (req, res, next) => {
  let body = req.body
  return authManager
    .ProfessionList(body, req)
    .then((data) => {
      let result = data.status ? {
        status: data.status,
        message: data.message,
      } :{
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let LogoutUser = (req, res, next) => {
  let body = req.body
  return authManager
    .LogoutUser(body, req)
    .then((data) => {
      let result = data.status ? {
        status: data.status,
        message: data.message,
      } :{
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let DeleteUserAccount = (req, res, next) => {
  let body = req.body
  return authManager
    .DeleteUserAccount(body, req)
    .then((data) => {
      let result = data.status ? {
        status: data.status,
        message: data.message,
      } :{
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

module.exports = {
  SendOtp: SendOtp,
  VerifyOtp: VerifyOtp,
  UpdateProfile: UpdateProfile,
  ProfileDetail: ProfileDetail,
  ProfessionList: ProfessionList,
  LogoutUser : LogoutUser,
  DeleteUserAccount: DeleteUserAccount
};
