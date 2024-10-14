let userManager = require('../manager/user');

let UserList = (req, res, next) => {
    return userManager
        .UserList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpdateUser = (req, res, next) => {
    return userManager
        .UpdateUser(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UserDetail = (req, res, next) => {
    return userManager
        .UserDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let DeleteUser = (req, res, next) => {
    return userManager
        .DeleteUser(req)
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
    UserList: UserList,
    UpdateUser: UpdateUser,
    UserDetail: UserDetail,
    DeleteUser: DeleteUser
 };