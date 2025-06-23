const { body } = require('express-validator')

exports.loginRules = [
    body('login')
        .notEmpty()
        .withMessage('Email or username is required.')
        .trim()
        .toLowerCase(),
    body('password')
        .isLength({ min: 10, max: 25 })
        .withMessage('Password must be between 10 and 25 characters.'),
];

exports.signupRules = [
    body('firstName')
        .isLength({ max: 50 })
        .notEmpty().withMessage('First name is required.')
        .trim(),

    body('lastName')
        .isLength({ max: 50 })
        .notEmpty().withMessage('Last name is required.')
        .trim(),

    body('username')
        .toLowerCase()
        .notEmpty().withMessage('Username is required.')
        .isLength({ min: 8, max: 25 }).withMessage('Username must be between 3 and 25 characters.')
        .matches(/^[a-zA-Z0-9_\-]+$/).withMessage('Username may only contain letters, numbers, underscores, or dashes.')
        .trim(),

    body('email')
        .isEmail()
        .withMessage('A valid email is required.')
        .normalizeEmail(),

    body('confirmEmail')
        .custom((value, { req }) => {
            if (value !== req.body.email) {
                throw new Error('Emails do not match.');
            }
            return true;
        }),

    body('password')
        .isLength({ min: 10, max: 25 })
        .withMessage('Password must be between 10 and 25 characters.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{10,25}$/)
        .withMessage('Password must include upper/lowercase, number, and symbol.'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
];