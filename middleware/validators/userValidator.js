const { body } = require('express-validator')

exports.validateProfileUpdate = [
    // Basic Info
    body('username')
        .optional()
        .isLength({ min: 4, max: 50 }).withMessage('Username must be between 4 and 50 characters.'),

    body('firstName')
        .optional()
        .isLength({ max: 50 }).withMessage('First name must be less than 50 characters.'),

    body('lastName')
        .optional()
        .isLength({ max: 50 }).withMessage('Last name must be less than 50 characters.'),

    body('style')
        .optional()
        .isLength({ max: 100 }).withMessage('Style must be less than 100 characters.'),

    body('rank')
        .optional()
        .isLength({ max: 100 }).withMessage('Rank must be less than 100 characters.'),

    body('avatar')
        .optional({ checkFalsy: true })
        .isLength({ max: 2048 }).withMessage('Avatar URL is too long.')
        .isURL().withMessage('Avatar must be a valid URL.'),

    // Email
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

    // Password
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 10, max: 25 }).withMessage('Password must be between 10 and 25 characters.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{10,25}$/)
        .withMessage('Password must include upper/lowercase, number, and symbol.'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (req.body.password && value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),

    // Current password required if email or password is changing
    body('currentPassword')
        .custom((value, { req, res }) => {
            const currentEmail = res.locals.currentUser?.email;

            if (
                req.body.password ||
                (req.body.email && currentEmail && req.body.email !== currentEmail)
            ) {
                if (!value) {
                    throw new Error('Current password is required to change email or password.');
                }
            }

            return true;
        })

];
