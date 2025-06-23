const { body } = require('express-validator')

exports.addUserRules = [
    body('username')
        .isLength({ min: 4, max: 50 }).withMessage('Username must be between 4 and 50 characters.'),
    body('email')
        .isEmail().withMessage('A valid email is required.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 10, max: 25 }).withMessage('Password must be between 10 and 25 characters.'),
    body('realName')
        .optional({ checkFalsy: true })
        .isLength({ max: 50 }).withMessage('Real name must be less than 50 characters.'),
    body('avatar')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Avatar must be a valid URL.')
        .isLength({ max: 2048 }).withMessage('Avatar URL is too long.')
];

exports.editUserRules = [
    body('username')
        .isLength({ min: 4, max: 50 }).withMessage('Username must be between 4 and 50 characters.'),
    body('email')
        .isEmail().withMessage('A valid email is required.')
        .normalizeEmail(),
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 10, max: 25 }).withMessage('Password must be between 10 and 25 characters.'),
    body('realName')
        .optional({ checkFalsy: true })
        .isLength({ max: 50 }).withMessage('Real name must be less than 50 characters.'),
    body('avatar')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Avatar must be a valid URL.')
        .isLength({ max: 2048 }).withMessage('Avatar URL is too long.')
];

exports.updateSettingsRules = [
    body('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('A valid email is required.')
        .normalizeEmail(),
    body('confirmEmail')
        .optional({ checkFalsy: true })
        .custom((value, { req }) => {
            if (value !== req.body.email) {
                throw new Error('Emails do not match.');
            }
            return true;
        }),
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 10, max: 25 }).withMessage('Password must be between 10 and 25 characters.'),
    body('confirmPassword')
    .optional({ checkFalsy: true })
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
    body('currentPassword')
        .notEmpty().withMessage('Current password is required.')
];