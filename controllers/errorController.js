const logger = require('../utils/loggerUtil');

// Controller for handling 404 errors
exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        statusCode: 404,
        message: "The page you're looking for does not exist.",
        error: null,
        showStack: false,
        showHomeLink: false
    
    });
};

// Controller for handling generic errors
exports.get500 = (err, req, res, next) => {
    res.status(err.status || 500).render('500', {
        pageTitle: 'Server Error',
        showstack: process.env.NODE_ENV !== 'production' ? err.stack : null
    });
};