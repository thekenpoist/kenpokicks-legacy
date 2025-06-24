exports.getDashboard = (req, res, next) => {
    res.render('portal/dashboard', { 
        pageTitle: 'Training Dashboard',
        currentPage: 'dashboard',
        user: res.locals.currentUser,
        showHomeLink: false
    });
};