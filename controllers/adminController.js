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

exports.getOneUser = async (req, res, next) => {
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
        const oneUser = await User.scope('forAdminShow').findByPk(userUuid);

        if (!oneUser) {
            return res.status(404).render('404', {
                pageTitle: 'User not found',
                layout: 'layouts/admin-layout',
                currentPage: 'users'
            });
        }
        res.render('admin/users/show-user', {
            pageTitle: 'View User',
            currentPage: 'users',
            errorMessage: null,
            user: oneUser
        });
    } catch (err) {
        logger.error(`Error fetching user: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'users');
    }
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
    const admin = res.locals.currentUser;
    const { uuid } = req.params;

    if (!admin) {
        return res.redirect('/auth/login');
    }

    if (admin.role !== 'admin') {
        return res.status(403).render('403', {
            pageTitle: 'Access Denied',
            currentPage: 'portal/dashboard',
            layout: 'layouts/dashboard-layout'
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`[admin.postEditUser] validation failed for uuid=${uuid}`);
        errors.array().forEach(err => logger.warn(`• ${err.param || 'field'} ${err.msg}`));

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

        const targetUser = await User.findByPk(uuid, {
            attributes: [
                'uuid', 'email', 'username', 'firstName', 'lastName', 
                'style', 'rank', 'avatar', 'timezone', 'isVerified', 'verificationToken'
            ]
        });
        if (!targetUser) {
            return res.status(404).render('404', {
                pageTitle: 'User profile not found',
                currentPage: 'users',
                layout: 'layouts/admin-layout'
            });
        }

        const {
            email = '',
            confirmEmail = '',
            firstName = '',
            lastName = '',
            username = '',
            rank = '',
            style = '',
            timezone = ''
        } = req.body;

        const normalizedInput = {
            email: email.trim().toLowerCase(),
            confirmEmail: confirmEmail.trim().toLowerCase(),
            username: username.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            rank: rank.trim(),
            style: style.trim(),
            timezone: timezone.trim()
        };

        if (!normalizedInput.email || normalizedInput.email !== normalizedInput.confirmEmail) {
            return res.status(422).render('admin/edit-user-profile', {
                pageTitle: 'Edit User Profile',
                currentPage: 'users',
                layout: 'layouts/admin-layout',
                errorMessage: 'Emails must match',
                formData: {
                    username: normalizedInput.username,
                    firstName: normalizedInput.firstName,
                    lastName: normalizedInput.lastName,
                    email: normalizedInput.email,
                    confirmEmail: normalizedInput.confirmEmail,
                    style: normalizedInput.style,
                    rank: normalizedInput.rank,
                    timezone: normalizedInput.timezone
                },
                submitLabel: 'Update Profile',
                formMode: 'edit',
                formAction: `/admin/users/${uuid}/update`
        });
        }
        

        const conflict = await User.findOne({
            where: {
                [Op.and]: [
                    { uuid: { [Op.ne]: uuid } },
                    { [Op.or]: [{ email: normalizedInput.email }, { username: normalizedInput.username }] },
                ]
            },
            attributes: ['uuid', 'email', 'username']
        }); 

        if (conflict) {
            const errorMsg = 
                conflict.email === normalizedInput.email
                    ? 'Email is already registered'
                    : 'Username is already taken';

            return res.status(400).render('admin/edit-user-profile', {
                pageTitle: 'Edit User Profile',
                currentPage: 'users',
                layout: 'layouts/admin-layout',
                errorMessage: errorMsg,
                formData: {
                    username: normalizedInput.username,
                    firstName: normalizedInput.firstName,
                    lastName: normalizedInput.lastName,
                    email: normalizedInput.email,
                    confirmEmail: normalizedInput.confirmEmail,
                    style: normalizedInput.style,
                    rank: normalizedInput.rank,
                    timezone: normalizedInput.timezone
                },
                submitLabel: 'Update Profile',
                formMode: 'edit',
                formAction: `/admin/users/${uuid}/update`
            });
        }

        const emailChanged = normalizedInput.email !== targetUser.email.toLowerCase();
        const updatedFields = {
            username: normalizedInput.username || targetUser.username,
            email: targetUser.email,
            firstName: normalizedInput.firstName || targetUser.firstName,
            lastName: normalizedInput.lastName || targetUser.lastName,
            style: normalizedInput.style || targetUser.style,
            rank: normalizedInput.rank || targetUser.rank,
            avatar: req.avatarPath || targetUser.avatar,
            timezone: normalizedInput.timezone || targetUser.timezone
        };

        // Handle email update and re-verification
        if (emailChanged) {
            const verificationToken = uuidv4();
            updatedFields.email = normalizedInput.email;
            updatedFields.isVerified = false;
            updatedFields.verificationToken = verificationToken;

            try {
                await sendVerificationEmail(normalizedInput.email, verificationToken);
            } catch (mailErr) {
                logger.error(`sendVerificationEmail failed for uuid=${uuid}: ${mailErr.message}`);
            }
        }

        await targetUser.update(updatedFields);

        // req.flash('success', 'Profile updated successfully.');
        return res.redirect(`/admin/users/${uuid}/edit`);

    } catch (err) {
        logger.error(`Error updating user ${uuid}: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        return renderServerError(res, err, 'users');
    }
};
