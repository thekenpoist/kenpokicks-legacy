const { validationResult } = require('express-validator');
const { User } = require('../models');
const argon2 = require('argon2')
const { Op } = require('sequelize')
const { renderServerError } = require('../utils/errorrUtil');
const logger = require('../utils/loggerUtil');


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
            }
        });
}


