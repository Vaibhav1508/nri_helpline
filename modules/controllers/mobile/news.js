let newsListManager = require('../../manager/mobile/news');

let NewsList = (req, res, next) => {
    return newsListManager
        .NewsList(req.body,req)
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

module.exports = {
    NewsList: NewsList
 };