// validators/adminValidator.js
const { body } = require('express-validator');

exports.validateUserUpdate = [
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

  // Timezone (IANA)
  body('timezone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((tz) => {
      try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; }
      catch { throw new Error('Timezone must be a valid IANA time zone.'); }
    }),

  // Email pair
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('A valid email is required.'),

  body('confirmEmail')
    .if(body('email').exists({ checkFalsy: true }))
    .trim()
    .custom((value, { req }) => value === req.body.email)
    .withMessage('Emails do not match.')
];
