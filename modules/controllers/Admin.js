let adminManager = require("../manager/Admin");

let Login = (req, res, next) => {
  return adminManager
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

let UsersDetail = (req, res, next) => {
  return adminManager
    .UsersDetail(req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let UserUpdate = (req, res, next) => {
  return adminManager
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

let ForgetPassword = (req, res, next) => {
  let body = req.body
  return adminManager
    .ForgetPassword(body,req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let ResetPassword = (req, res, next) => {
  let body = req.body
  return adminManager
    .ResetPassword(body, req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let ChangePassword = (req, res, next) => {
  let body = req.body
  return adminManager
    .ChangePassword(body, req)
    .then((data) => {
      let result = {
        status: 200,
        data: data,
      };
      return res.json(result);
    })
    .catch(next);
};

let SendOtp = (req, res, next) => {
  let body = req.body
  return adminManager
    .SendOtp(body,req)
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
  UsersDetail: UsersDetail,
  UserUpdate: UserUpdate,
  ForgetPassword: ForgetPassword,
  ResetPassword: ResetPassword,
  ChangePassword: ChangePassword,
  SendOtp:SendOtp
};
