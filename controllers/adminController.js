const { User } = require('../models');


exports.getAdminConsole = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    let student = 0;
    let instructor = 0;
    let admin = 0;

    const users = await User.findAll();

    users.forEach(user => {
        if (user.role === 'admin') { 
            admin++;
            instructor++;
            student++;    
        } else if (user.role === 'instructor') {
            instructor++;
            student++;
        } else if (user.role === 'student') {
            student++;
        }
    });

    if (user.role !== 'admin') {
        return res.status(403).render('403', {
            pageTitle: 'Access Denied',
            currentPage: 'portal/dashboard',
            layout: 'layouts/dashboard-layout'
        });
    }
    
    res.render('admin/admin', {
        pageTitle: `Admin Console`,
        currentPage: 'admin',
        layout: 'layouts/admin-layout',
        errorMessage: null
    });
};