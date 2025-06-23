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