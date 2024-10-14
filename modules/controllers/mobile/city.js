let cityManager = require('../../manager/mobile/city');

let CityList = (req, res, next) => {
    return cityManager
        .CityList(req.body,req)
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
    CityList: CityList
 };