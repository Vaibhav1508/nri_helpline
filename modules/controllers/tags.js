let tagManager = require('../manager/tags');

let CreateTag = (req, res, next) => {
    return tagManager
        .CreateTag(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

let TagList = (req, res, next) => {
    return tagManager
        .TagList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpdateTag = (req, res, next) => {
    return tagManager
        .UpdateTag(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let TagDetail = (req, res, next) => {
    return tagManager
        .TagDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let DeleteTag = (req, res, next) => {
    return tagManager
        .DeleteTag(req)
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
    CreateTag: CreateTag,
    TagList: TagList,
    UpdateTag: UpdateTag,
    TagDetail: TagDetail,
    DeleteTag: DeleteTag
 };