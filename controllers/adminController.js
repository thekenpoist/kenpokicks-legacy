const { User } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/loggerUtil');
const { renderServerError } = require('../utils/errorUtil');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { sendVerificationEmail } = require('../utils/sendVerificationEmailUtil');



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
                formAction: `/admin/users/${userUuid}/update`
            });
        } catch (err) {
            logger.error(`Error fetching user profile: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
            return renderServerError(res, err, 'users');
    }
};

exports.postEditUser = async (req, res, next) => {
    const user = res.locals.currentUser;
    const { uuid } = req.params;

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

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const userEmail = res?.locals?.currentUser?.email || 'unknown';

        logger.warn(`Validation failed during profile update for user: ${userEmail}`);
        errors.array().forEach(err => {
            const field = err.param || 'unknown';
            logger.warn(`• ${field}: ${err.msg}`);
        });

        return res.status(422).render('admin/edit-user-profile', {
            pageTitle: 'Edit User Profile',
            currentPage: 'users',
            layout: 'layouts/admin-layout',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body,
            submitLabel: 'Update Profile',
            formMode: 'edit',
            formAction: `/admin/users/${uuid}/update`
        });
    }

    try {
        const {
            email,
            firstName,
            lastName,
            username,
            rank,
            style,
            timezone
        } = req.body;

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedUsername = username.trim().toLowerCase();

        const emailChanged = trimmedEmail !== user.email.toLowerCase();

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: trimmedEmail },
                    { username: trimmedUsername }
                ],
                uuid: { [Op.ne]: uuid }
            }
        });

        if (existingUser) {
            let errorMsg = 'Username or email already in use';
            if (existingUser.email === trimmedEmail) {
                errorMsg = 'Email is already registered';
            } else if (existingUser.username === trimmedUsername) {
                errorMsg = 'Username is already taken';
            }

            return res.status(400).render('admin/edit-user-profile', {
                pageTitle: 'Edit User Profile',
                currentPage: 'users',
                layout: 'layouts/admin-layout',
                errorMessage: errorMsg,
                formData: req.body,
                submitLabel: 'Update Profile',
                formMode: 'edit',
                formAction: `/admin/users/${uuid}/update`
            });
        }

        const updatedFields = {
            username: trimmedUsername || user.username,
            email: user.email,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            style: style || user.style,
            rank: rank || user.rank,
            avatar: req.avatarPath || user.avatar,
            timezone: timezone || user.timezone,
            updatedAt: new Date()
        };

        // Handle email update and re-verification
        if (emailChanged) {
            const verificationToken = uuidv4();
            updatedFields.email = trimmedEmail;
            updatedFields.isVerified = false;
            updatedFields.verificationToken = verificationToken;
            await sendVerificationEmail(trimmedEmail, verificationToken);
        }

        await User.update(updatedFields, { where: { uuid } });
        const updatedUser = await User.findOne({ where: { uuid } });
        res.locals.currentUser = updatedUser;

        // req.flash('success', 'Profile updated successfully.');
        return res.redirect(`/admin/users/${uuid}/update`);

    } catch (err) {
        logger.error(`Error updating user: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        res.status(500).render('admin/edituser-profile', {
            pageTitle: 'Edit User Profile',
            currentPage: 'users',
            layout: 'layouts/admin-layout',
            errorMessage: 'Something went wrong. Please try again.',
            formData: req.body,
            submitLabel: 'Update Profile',
            formMode: 'edit',
            formAction: `/admin/users/${uuid}/update`
        });
    }
};
