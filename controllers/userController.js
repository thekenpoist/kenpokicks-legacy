const { validationResult } = require('express-validator');
const { User } = require('../models');
const argon2 = require('argon2')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid');
const { renderServerError } = require('../utils/errorrUtil');
const { sendVerificationEmail } = require('../utils/sendVerificationEmailUtil');
const logger = require('../utils/loggerUtil');
const { logoutAndRedirect } = require('../utils/sessionUtil');
const { rmSync } = require('fs');

exports.getShowProfile = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    res.render('profiles/show-profile', {
        pageTitle: 'Show Profile',
        currentPage: 'profile',
        layout: 'layouts/dashboard-layout',
        errorMessage: null,
        user
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
    const errors = validationResult(req);

    if (!user) {
        return res.redirect('/auth/login');
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
        if ((password && password.trim()) || emailChanged) {
            if (!currentPassword || !(await argon2.verify(user.password, currentPassword))) {
                return res.status(403).render('profiles/edit-profile', {
                    pageTitle: 'Edit Profile',
                    currentPage: 'profile',
                    errorMessage: 'Current password is incorrect.',
                    formData: req.body
                });
            }
        }

        const newHashPassword =
            password && password.trim().length > 0
                ? await argon2.hash(password.trim())
                : user.password;

        const passwordChanged = !(await argon2.verify(user.password, newHashPassword));

        const updatedFields = {
            username: trimmedUsername || user.username,
            email: trimmedEmail || user.email,
            password: newHashPassword,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            style: style || user.style,
            rank: rank || user.rank,
            avatar: req.avatarPath || user.avatar,
            timezone: timezone || user.timezone,
            updatedAt: new Date()
        };

        // Handle email change
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
