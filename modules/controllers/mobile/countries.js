let slidersManager = require('../../manager/mobile/countries');

let CountryList = (req, res, next) => {
    console.log("In controller")
    return slidersManager
        .CountryList(req.body,req)
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
    CountryList: CountryList
 };