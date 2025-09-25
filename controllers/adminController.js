const { User } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/loggerUtil');
const { renderServerError } = require('../utils/errorUtil');


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

exports.getAllUsers = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const allUsers = await User.findAll();
        const usersPlain = allUsers.map(u => u.get({ plain: true }));

        if (allUsers.length === 0) {
            return res.status(404).render('404', {
                pageTitle: 'No users found',
                currentPage: 'admin'
            });
        }

        res.render('admin/all-users', {
            pageTitle: 'All users',
            currentPage: 'users',
            layout: 'layouts/admin-layout',
            errorMessage: null,
            allUsers: usersPlain
        });
    } catch (err) {
        logger.error(`Error fetching all users: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack)
        }
        return renderServerError(res, err, 'portal/dashboard');
    }
};

exports.getEditUser = async (req, res, next) => {
    
}