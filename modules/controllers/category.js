let categorysManager = require('../manager/category');

let CreateCategory = (req, res, next) => {
    return categorysManager
        .CreateCategory(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
} 

let CategoryList = (req, res, next) => {
    return categorysManager
        .CategoryList(req.body)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let UpdateCategory = (req, res, next) => {
    return categorysManager
        .UpdateCategory(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let CategoryDetail = (req, res, next) => {
    return categorysManager
        .CategoryDetail(req)
        .then(data => {
            let result = {
                status:200,
                data: data
            }
            return res.json(result);
        })
        .catch(next);
}

let DeleteCategory = (req, res, next) => {
    return categorysManager
        .DeleteCategory(req)
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
    CreateCategory: CreateCategory,
    CategoryList: CategoryList,
    UpdateCategory: UpdateCategory,
    CategoryDetail: CategoryDetail,
    DeleteCategory: DeleteCategory
 };