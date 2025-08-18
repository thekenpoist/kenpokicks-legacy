const { User } = require('../models');
const { Op } = require('sequelize');


exports.getAdminConsole = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    const students = await User.count({ where: { role: { [Op.in]: ['student', 'instructor', 'admin'] } } });
    const instructors = await User.count({ where: { role: { [Op.in]: ['instructor', 'admin'] } } });
    const admins = await User.count({ where: { role : { [Op.in]: ['admin'] } } });

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
        errorMessage: null,
        stats: { studentCount: students, instructorCount: instructors, adminCount: admins }
    });
};