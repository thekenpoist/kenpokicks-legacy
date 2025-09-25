const { validationResult } = require('express-validator');
const { User } = require('../models');
const argon2 = require('argon2')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid');
const { renderServerError } = require('../utils/errorUtil');
const { sendVerificationEmail } = require('../utils/sendVerificationEmailUtil');
const { logger } = require('../utils/loggerUtil');
const { logoutAndRedirect } = require('../utils/sessionUtil');
const { rmSync } = require('fs');

exports.getShowProfile = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    const memberSinceFormatted = user.createdAt.toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const lastLoggedInFormatted = user.lastLoggedIn
        ? new Date(user.lastLoggedIn).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
            })
        : 'N/A';

    res.render('profiles/show-profile', {
        pageTitle: 'Show Profile',
        currentPage: 'profile',
        layout: 'layouts/dashboard-layout',
        errorMessage: null,
        user,
        memberSinceFormatted,
        lastLoggedInFormatted
    });
};

exports.getEditProfile = (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    res.render('profiles/edit-profile', {
            pageTitle: "Edit Profile",
            currentPage: 'profile',
            layout: 'layouts/dashboard-layout',
            errorMessage: null,
            formData: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                confirmEmail: user.email,
                style: user.style || '',
                rank: user.rank || '',
                timezone: user.timezone || ''
            },
            submitLabel: 'Update Profile',
            formMode: 'edit',
            formAction: '/profiles/edit-profile'
        });
}

exports.postEditProfile = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const userEmail = res?.locals?.currentUser?.email || 'unknown';

        logger.warn(`Validation failed during profile update for user: ${userEmail}`);
        errors.array().forEach(err => {
            const field = err.param || 'unknown';
            logger.warn(`• ${field}: ${err.msg}`);
        });

        return res.status(422).render('profiles/edit-profile', {
            pageTitle: 'Edit Profile',
            currentPage: 'profile',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body
        });
    }

    try {
        const {
            email,
            password,
            currentPassword,
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
        const passwordChanged = password && password.trim().length > 0;

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: trimmedEmail },
                    { username: trimmedUsername }
                ],
                uuid: { [Op.ne]: user.uuid }
            }
        });

        if (existingUser) {
            let errorMsg = 'Username or email already in use';
            if (existingUser.email === trimmedEmail) {
                errorMsg = 'Email is already registered';
            } else if (existingUser.username === trimmedUsername) {
                errorMsg = 'Username is already taken';
            }

            return res.status(400).render('profiles/edit-profile', {
                pageTitle: 'Edit Profile',
                currentPage: 'profile',
                errorMessage: errorMsg,
                formData: req.body
            });
        }

        // Require current password if sensitive info is changing
        if ((passwordChanged || emailChanged)) {
            if (!currentPassword || !(await argon2.verify(user.password, currentPassword))) {
                return res.status(403).render('profiles/edit-profile', {
                    pageTitle: 'Edit Profile',
                    currentPage: 'profile',
                    errorMessage: 'Current password is incorrect.',
                    formData: req.body
                });
            }
        }

        const updatedFields = {
            username: trimmedUsername || user.username,
            email: user.email,
            password: user.password,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            style: style || user.style,
            rank: rank || user.rank,
            avatar: req.avatarPath || user.avatar,
            timezone: timezone || user.timezone,
            updatedAt: new Date()
        };

        // Handle password update
        if (passwordChanged) {
            updatedFields.password = await argon2.hash(password.trim());
        }

        // Handle email update and re-verification
        if (emailChanged) {
            const verificationToken = uuidv4();
            updatedFields.email = trimmedEmail;
            updatedFields.isVerified = false;
            updatedFields.verificationToken = verificationToken;
            await sendVerificationEmail(trimmedEmail, verificationToken);
        }

        await User.update(updatedFields, { where: { uuid: user.uuid } });
        const updatedUser = await User.findOne({ where: { uuid: user.uuid } });
        res.locals.currentUser = updatedUser;

        if (emailChanged) {
            return logoutAndRedirect(req, res, '/auth/login', 'emailChange=1');
        }

        if (passwordChanged) {
            return logoutAndRedirect(req, res, '/auth/login', 'passwordChange=1');
        }

        req.flash('success', 'Profile updated successfully.');
        res.redirect(`/portal/dashboard`);

    } catch (err) {
        logger.error(`Error updating user: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        res.status(500).render('profiles/edit-profile', {
            pageTitle: 'Edit Profile',
            currentPage: 'profile',
            errorMessage: 'Something went wrong. Please try again.',
            formData: req.body
        });
    }
};

exports.deleteProfile = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const deleted = await User.destroy({ where: { uuid: user.uuid }});

        if (!deleted) {
            return res.status(404).render('404', {
                pageTitle: 'User Not Found',
                currentPage: 'profile'
            });
        }

        req.flash('info', 'Profile deleted successfully.');
        
        req.session.destroy(err => {
            if (err) {
                logger.error(`Error deleting user ${err.message}`);
                if (err.stack) {
                    logger.error(err.stack);
                }
                return res.redirect('/');
            }

            res.redirect('/');
            
        });
    } catch (err) {
        logger.error(`Error deleting user ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        return renderServerError(res, err, '/');
    }
};