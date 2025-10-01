// validators/userValidator.js
const { body } = require('express-validator');

exports.validateProfileUpdate = [
  // Basic Info
  body('username')
    .optional({ checkFalsy: true })
    .trim().toLowerCase()
    .isLength({ min: 4, max: 50 }).withMessage('Username must be between 4 and 50 characters.'),

  body('firstName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('First name must be less than 50 characters.'),

  body('lastName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Last name must be less than 50 characters.'),

  body('style')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Style must be less than 100 characters.'),

  body('rank')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Rank must be less than 100 characters.'),

  body('avatar')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2048 }).withMessage('Avatar URL is too long.')
    .isURL().withMessage('Avatar must be a valid URL.'),

  // Email
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('A valid email is required.'),

  body('confirmEmail')
    .if(body('email').exists({ checkFalsy: true }))
    .trim()
    .custom((value, { req }) => value === req.body.email)
    .withMessage('Emails do not match.'),

  // Password (optional on profile edit)
  body('password')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 25 }).withMessage('Password must be between 10 and 25 characters.').bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{10,25}$/)
    .withMessage('Password must include upper and lower case, a number, and a symbol.'),

  body('confirmPassword')
    .if(body('password').exists({ checkFalsy: true }))
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),

  // Current password required if changing email or password
  body('currentPassword')
    .custom((value, { req }) => {
      const currentEmail = req.currentUser?.email;
      const emailProvided = req.body.email && currentEmail && req.body.email !== currentEmail;
      const passwordProvided = Boolean(req.body.password);
      if ((emailProvided || passwordProvided) && !value) {
        throw new Error('Current password is required to change email or password.');
      }
      return true;
    })
];
