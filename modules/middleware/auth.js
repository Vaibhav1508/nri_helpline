'use strict';

let validateApiKey = (req, res, next) => {
    // Bypass API key validation entirely
    req.is_swagger_api = true;  // You can keep this if you need to use it later
    next();
};

module.exports = {
    validateApiKey: validateApiKey
};
