const { validationResult, Result } = require('express-validator');
const { User } = require('../models');
const argon2 = require('argon2');
const { Op } = require('sequelize');
const { sendVerificationEmail } = require('../utils/sendVerificationEmailUtil');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/loggerUtil');

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: "Sign Up",
        currentPage: 'signup',
        errorMessage: null,
        formData: {},
        submitLabel: 'Sign Up',
        formAction: '/auth/signup',
        formMode: 'signup'
    });
};

exports.postSignup = async (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Sign Up',
            currentPage: 'signup',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body
        });
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
                ]
            }
        });

        if (existingUser) {
            let errorMsg = 'Username or email already in use';

            if (existingUser.email === trimmedEmail) {
                errorMsg = 'Email is already registered'
            } else if (existingUser.username === trimmedUsername) {
                errorMsg = 'Username is already taken'
            }

            return res.status(400).render('auth/signup', {
                pageTitle: 'Sign Up',
                currentPage: 'signup',
                errorMessage: errorMsg,
                formData: req.body
            });
        }

        const lastLoggedIn = new Date();
        const hashedPassword = await argon2.hash(password);
        const verificationToken = uuidv4();

        const newUser = await User.create({
            username: trimmedUsername,
            firstName,
            lastName,
            email: trimmedEmail,
            password: hashedPassword,
            rank: rank || 'White Belt',
            style: style || 'None',
            avatar: req.avatarPath || null,
            timezone,
            lastLoggedIn,
            verificationToken,
            isVerified: false
        });

        await sendVerificationEmail(newUser.email, verificationToken);

        req.session.userUuid = newUser.uuid;

        req.session.save(err => {
            if (err) {
                logger.error('Session save error:', err);
            }
            res.redirect('/auth/check-email');
        });

    } catch (err) {
        logger.error(`Error during signup: ${err.message}`);
        if (err.errors) {
        err.errors.forEach(e => logger.error(`  - ${e.message}`));
        }
        res.status(500).render('auth/signup', {
            pageTitle: 'Sign Up',
            currentPage: 'signup',
            errorMessage: err.message || 'Something went wrong. Please try again.',
            formData: req.body
        });
    }
};

exports.getCheckEmail = (req, res) => {
    res.render('auth/check-email', {
        pageTitle: 'Verify Your Email',
        currentPage: 'check-email'
    });
};

exports.getVerifyEmail = async (req, res, next) => {
    const user = await User.findOne({ where: { verificationToken: req.query.token }});
    logger.info(`Received verification token "${req.query.token}" for user: ${user.email}`);

    if (user) {
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
        res.render('auth/verified', { pageTitle: 'Email Verified', currentPage: 'verified' });
    } else {
        res.status(200).send('Invalid or expired token');
    }
}

exports.getLogin = async (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        currentPage: 'login',
        errorMessage: null,
        emailChange: req.query.emailChange === '1'
    });
};

exports.postLogin = async (req, res, next) => {
    const { login, password } = req.body;

    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: login.trim().toLowerCase() },
                    { username: login.trim().toLowerCase() }
                ]
            }
        });

        if (!user) {
            return res.status(401).render('auth/login', {
                pageTitle: 'Login',
                currentPage: 'login',
                errorMessage: 'Invalid credential'
            });
        }

        if (user.lockoutUntil && new Date() < user.lockoutUntil) {
            const minutesLeft = Math.ceil((user.lockoutUntil - new Date()) / 60000);
            return res.status(401).render('auth/login', {
                pageTitle: 'Login',
                currentPage: 'login',
                errorMessage: `Account locked. Try again in ${minutesLeft} minutes`
            });

        }

        if (!user.isVerified) {
            return res.status(401).render('auth/login', {
                pageTitle: 'Login',
                currentPage: 'login',
                errorMessage: 'Please verify your account before logging in.'
            });
        }

        if (!(await argon2.verify(user.password, password))) {
            user.failedLoginAttempts += 1
            if (user.failedLoginAttempts >= 5) {
                user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await user.save()
            return res.status(401).render('auth/login', {
                pageTitle: 'Login',
                currentPage: 'login',
                errorMessage: user.failedLoginAttempts >= 5
                    ? '5 incorrect password attempts. Please wait 15 minutes before trying again.'
                    : 'Invalid credentials!'
            });
        }
        
        user.failedLoginAttempts = 0;
        user.lockoutUntil = null;
        user.lastLoggedIn = new Date();
        await user.save();
        req.session.userUuid = user.uuid;

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
            }
            res.redirect('/portal/dashboard');
        });

    } catch (err) {
        logger.error(`Login error: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        res.status(500).render('auth/login', {
            pageTitle: 'Login',
            currentPage: 'login',
            errorMessage: 'An error occurred. Please try again.'
        });
    }
};

exports.getLogout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            logger.error(`Logout session destroy error: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }

            return res.status(500).render('500', {
                pageTitle: 'Logout Error',
                currentPage: 'logout',
                errorMessage: 'Could not log you out. Please try again.'
            });
        }
        res.redirect('/');
    });
};