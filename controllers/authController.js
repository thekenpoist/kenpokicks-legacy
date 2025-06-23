const { validationResult, Result } = require('express-validator');
const { User } = require('../models');
const argon2 = require('argon2');
const { Op } = require('sequelize');
const { generateUniqueUsername } = require('../utils/generateUsername');
const { sendVerificationEmail } = require('../utils/sendVerificationEmail');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: "Sign Up",
        currentPage: 'signup',
        errorMessage: null,
        formData: {}
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
        const { email, password } = req.body;

        const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });

        if (existingUser) {
            return res.status(400).render('auth/signup', {
                pageTitle: 'Sign Up',
                currentPage: 'signup',
                errorMessage: 'Email is already registered',
                formData: req.body
            });
        }

        const timezone = req.session.timezone;
        const lastLoggedIn = new Date();

        const username = await generateUniqueUsername(email);
        const hashedPassword = await argon2.hash(password);

        const verificationToken = uuidv4();

        const newUser = await User.create({
            username,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            firstName: '',
            lastName: '',
            rank: '',
            style: '',
            role: '',
            avatar: '',
            timezone: timezone,
            lastLoggedIn: lastLoggedIn,
            verificationToken: verificationToken,
            isVerified: false
        });

        await sendVerificationEmail(newUser.email, verificationToken);

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
            }
            res.redirect('/dashboard');
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
        errorMessage: null
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
                errorMessage: 'Invalid username'
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
            res.redirect('/dashboard');
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

exports.postLogout = (req, res, next) => {
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