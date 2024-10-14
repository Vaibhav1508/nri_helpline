let stateManager = require('../../manager/mobile/state');

let StateList = (req, res, next) => {
    return stateManager
        .StateList(req.body,req)
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
    StateList: StateList
};