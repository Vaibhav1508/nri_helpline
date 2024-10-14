let dashboardManager = require('../manager/dashboard');

let Dashboard = (req, res, next) => {
    return dashboardManager
        .Dashboard(req.body)
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
    Dashboard: Dashboard
 };