let newsManager = require('../manager/news');

let CreateNews = (req, res, next) => {
    return newsManager
        .CreateNews(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

let NewsList = (req, res, next) => {
    return newsManager
        .NewsList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpdateNews = (req, res, next) => {
    return newsManager
        .UpdateNews(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let NewsDetail = (req, res, next) => {
    return newsManager
        .NewsDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let DeleteNews = (req, res, next) => {
    return newsManager
        .DeleteNews(req)
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
    CreateNews: CreateNews,
    NewsList: NewsList,
    UpdateNews: UpdateNews,
    NewsDetail: NewsDetail,
    DeleteNews: DeleteNews
 };