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

    if (user.role !== 'admin') {
        return res.status(403).render('403', {
            pageTitle: 'Access Denied',
            currentPage: 'portal/dashboard',
            layout: 'layouts/dashboard-layout'
        });
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
    const user = res.locals.currentUser;
    const userUuid = req.params.uuid;

    if (!user) {
        return res.redirect('/auth/login');
    }

    if (user.role !== 'admin') {
        return res.status(403).render('403', {
            pageTitle: 'Access Denied',
            currentPage: 'portal/dashboard',
            layout: 'layouts/dashboard-layout'
        });
    }

    try {
        const userProfile = await User.findByPk(userUuid, {
            attributes: ['uuid','username','firstName','lastName','email','style','rank','timezone', 'fullName']
        });

        if (!userProfile) {
            return res.status(404).render('404', {
                pageTitle: 'User profile not found',
                layout: 'layouts/admin-layout',
                currentPage: 'users'
            });
        }

        return res.render('admin/edit-user-profile', {
                pageTitle: "Edit User Profile",
                currentPage: 'users',
                layout: 'layouts/admin-layout',
                errorMessage: null,
                formData: {
                    username: userProfile.username,
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    email: userProfile.email,
                    confirmEmail: userProfile.email,
                    style: userProfile.style || '',
                    rank: userProfile.rank || '',
                    timezone: userProfile.timezone || ''
                },
                submitLabel: 'Update Profile',
                formMode: 'edit',
                formAction: '/admin/users/${userUuid}/update'
            });
        } catch (err) {
            logger.error(`Error fetching user profile: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
            return renderServerError(res, err, 'users');
    }
};