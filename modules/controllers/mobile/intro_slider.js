let slidersManager = require('../../manager/mobile/intro_slider');

let SliderList = (req, res, next) => {
    return slidersManager
        .SliderList(req.body,req)
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
    SliderList: SliderList
 };