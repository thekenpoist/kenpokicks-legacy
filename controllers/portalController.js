exports.getDashboard = (req, res, next) => {
    const user = res.locals.currentUser;

    const lastLoggedInFormatted = user?.lastLoggedIn
        ? new Date(user.lastLoggedIn).toLocaleString('en-us', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        : 'N/A';

    res.render('portal/dashboard', { 
        pageTitle: 'Training Dashboard',
        currentPage: 'dashboard',
        user: res.locals.currentUser,
        lastLoggedInFormatted,
        showHomeLink: false
    });
};