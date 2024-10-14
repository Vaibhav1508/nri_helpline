let masterManager = require('../../manager/mobile/master');

let MasterList = (req, res, next) => {
    return masterManager
        .MasterList(req.body,req)
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
    MasterList: MasterList
 };