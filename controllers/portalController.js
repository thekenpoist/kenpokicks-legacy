exports.getDashboard = (req, res, next) => {
    const userUuid = req.session.userUuid;

    if (!userUuid) {
        return res.redirect('/auth/login');
    }

    const lastLoggedInFormatted = userUuid.lastLoggedIn
        ? new Date(user.lastLoggedIn).toLocaleString('en-us', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        : 'N/A';
    console.log(userUuid.lastLoggedIn);
    console.log(lastLoggedInFormatted);

    res.render('portal/dashboard', { 
        pageTitle: 'Training Dashboard',
        currentPage: 'dashboard',
        user: res.locals.currentUser,
        lastLoggedInFormatted,
        showHomeLink: false
    });
};