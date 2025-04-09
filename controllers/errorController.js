exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        statusCode: 404,
        message: "The page you're looking for does not exist.",
        error: null,
        showStack: false
    
    });
};

exports.get500 = (err, req, res, next) => {
    console.error('Server Error', err.stack);
    res.status(500).render('error', {
        pageTitle: 'Server Error',
        statusCode: 500,
        message: 'An unexpected error occurred',
        error: err,
        showStack: process.env.NODE_ENV !== 'production'
    });
};