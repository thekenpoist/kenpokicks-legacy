const { validationResult } = require('express-validator');
const { User } = require('../models');
const argon2 = require('argon2')
const { Op } = require('sequelize')
const { renderServerError } = require('../utils/errorrUtil');
const logger = require('../utils/loggerUtil');


exports.getEditProfile = (req, res, next) => {
    const user = res.locals.CurrentUser;

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
            }
        });
}

exports.postEditProfile = async (req, res, next) => {
    const user = res.locals.currentUser;
    const errors = validationResult(req);

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const { email, password, firstName, lastName, username, rank, style, timezone } = req.body;

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedUsername = username.trim().toLowerCase();

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
                errorMsg = 'Email is already registered'
            } else if (existingUser.username === trimmedUsername) {
                errorMsg = 'Username is already taken'
            }
        }

        const updatedFields = {
            username: username?.trim().toLowerCase() || user.username,
            email: email?.trim().toLowerCase() || user.email,
            password: password
                ? await argon2.hash(password)
                : user.password,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            style: style || user.style,
            rank: rank || user.rank,
            avatar: req.avatarPath || user.avatar,
            timezone: timezone || user.timezone,
            updatedAt: new Date()
        };

        await User.update(updatedFields, { where: { uuid: user.uuid } });

        const updatedUser = await User.findOne({ where: { uuid: user.uuid } });
        res.locals.currentUser = updatedUser;

        res.redirect(`/dashboard`);
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