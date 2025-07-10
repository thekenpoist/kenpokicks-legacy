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
    logger.error(`Server Error ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

    res.status(500).render('500', {
        pageTitle: 'Server Error',
        statusCode: 500,
        message: 'An unexpected error occurred',
        err: err,
        showstack: process.env.NODE_ENV !== 'production',
    });
};

// Controller for handling csrf errors
exports.get403 = (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).render('403', {
            pageTitle: 'Security Error',
            currentPage: '',
            message: 'Invalid or expired CSRF token. Please try again.'
        });
    }
};