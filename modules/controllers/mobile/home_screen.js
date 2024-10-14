let homeScreenManager = require('../../manager/mobile/home_screen');

let HomeScreen = (req, res, next) => {
    return homeScreenManager
        .HomeScreen(req.body,req)
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
    HomeScreen: HomeScreen
 };