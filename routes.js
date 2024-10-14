'use strict';

const HTTP_STATUS = require('./modules/constants/httpStatus'),
    auth = require('./modules/middleware/auth');


module.exports = app => {
    app.use((req, res, next) => {
        console.log("Request", req.url)
        if (req.url == "/terms_of_service") {
            res.sendFile(__dirname + '/modules/views/terms_of_service.html');
        } else if (req.url == "/privacy_policy") {
            res.sendFile(__dirname + '/modules/views/privacy_policy.html');
        } else if (req.url == "/about_us") {
            res.sendFile(__dirname + '/modules/views/about_us.html');
        } else {
            next();
        }
    });

    app.use(auth.validateApiKey);
    app.use('/api/v1/Admin', require('./modules/routes/Admin'));

    app.use('/api/v1/intro_slider', require('./modules/routes/slider'));
    app.use('/api/v1/category', require('./modules/routes/category'));
    app.use('/api/v1/user', require('./modules/routes/user'));
    app.use('/api/v1/tags', require('./modules/routes/tags'));
    app.use('/api/v1/news', require('./modules/routes/news'));
    app.use('/api/v1/upcoming_service', require('./modules/routes/upcoming_service'));
    app.use('/api/v1/upcoming_service_feedback', require('./modules/routes/upcoming_service_feedback'));
    app.use('/api/v1/poll_questions', require('./modules/routes/poll_questions'));
    app.use('/api/v1/push_notification', require('./modules/routes/push_notification'));
    app.use('/api/v1/dashboard', require('./modules/routes/dashboard'));

    app.use('/api/v1/mobile/auth', require('./modules/routes/mobile/auth'));
    app.use('/api/v1/mobile/intro_slider', require('./modules/routes/mobile/intro_slider'));
    app.use('/api/v1/mobile/countries', require('./modules/routes/mobile/countries'));
    app.use('/api/v1/mobile/state', require('./modules/routes/mobile/state'));
    app.use('/api/v1/mobile/city', require('./modules/routes/mobile/city'));
    app.use('/api/v1/mobile/profession', require('./modules/routes/mobile/auth'));

    app.use('/api/v1/mobile/home_screen', require('./modules/routes/mobile/home_screen'));
    app.use('/api/v1/mobile/categories', require('./modules/routes/mobile/categories'));
    app.use('/api/v1/mobile/news', require('./modules/routes/mobile/news'));
    app.use('/api/v1/mobile/upcoming_service', require('./modules/routes/mobile/upcoming_service'));
    app.use('/api/v1/mobile/master', require('./modules/routes/mobile/master'));
    app.use('/api/v1/mobile/poll_questions', require('./modules/routes/mobile/poll_questions'));
    app.use('/api/v1/mobile/notification', require('./modules/routes/mobile/notification'));

    // app.use('/api/v1/country', require('./modules/routes/Country'));

    /**
     * Throw 404 for all other routes.
     */
    app.use((req, res, next) => {

        /**
         * Header sent will be false if none of the above routes matched.
         */
        if (res._headerSent) {
            return next();
        }

        /**
         *  Else, throw 404
         */
        res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'This route doesn\'t exist' });
    });
};