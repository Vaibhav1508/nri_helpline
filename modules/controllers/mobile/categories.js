let categoryManager = require('../../manager/mobile/categories');

let Categories = (req, res, next) => {
    return categoryManager
        .Categories(req.body,req)
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
    Categories: Categories
 };