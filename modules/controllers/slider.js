let slidersManager = require('../manager/sliders');

let CreateSlider = (req, res, next) => {
    return slidersManager
        .CreateSlider(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

let SliderList = (req, res, next) => {
    return slidersManager
        .SliderList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpdateSlider = (req, res, next) => {
    return slidersManager
        .UpdateSlider(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let SliderDetail = (req, res, next) => {
    return slidersManager
        .SliderDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let DeleteSlider = (req, res, next) => {
    return slidersManager
        .DeleteSlider(req)
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
    CreateSlider: CreateSlider,
    SliderList: SliderList,
    UpdateSlider: UpdateSlider,
    SliderDetail: SliderDetail,
    DeleteSlider: DeleteSlider
 };