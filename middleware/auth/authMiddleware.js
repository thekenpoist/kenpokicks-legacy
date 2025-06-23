exports.isAuthenticated = (req, res, next) => {
    if (res.locals.currentUser) {
        return next();
    }
    res.redirect('/auth/login');
};