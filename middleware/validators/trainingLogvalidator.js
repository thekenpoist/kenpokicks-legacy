const { body } = require('express-validator');

exports.createTrainingLogRules = [
    body('logCategory')
        .isIn([
            'Bag/Pad Work',
            'Basics',
            'Cardio',
            'Dry Fire',
            'Field Training',
            'Forms',
            'Grappling',
            'Instruction',
            'Live Fire',
            'Meditation',
            'Recovery',
            'Sets',
            'Skill Drills',
            'Sparring',
            'Stretching',
            'Techniques',
            'Weightlifting',
            'Weapons Practice'
        ])
        .withMessage('Invalid category selected.'),
    body('logTitle')
        .trim()
        .notEmpty().withMessage('A title is required')
        .isLength({ max: 50 }).withMessage('Title must be less than 50 characters.'),
    body('logDescription')
        .trim()
        .notEmpty().withMessage('A description is require')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters.'),
    body('logDuration')
            .isInt({ min: 1, max: 1440})
            .withMessage('Duration must be a number between 1 and 1440 (in minutes).'),
    body('logRelatedBelt')
        .isIn([
            'Yellow', 
            'Orange', 
            'Purple',
            'Blue',
            'Green',
            'Brown',
            'Red',
            'Red/Black',
            'Black',
            'N/A'
        ])
        .withMessage('Invalid belt selected'),
    body('logDateTime')
        .isISO8601().withMessage('Log date must be a valid date.')
        .toDate(),
    body('logIsPrivate')
        .customSanitizer(value => value === 'on')
        .default(false)
        .isBoolean().withMessage('Invalid value for privacy setting'),
    body('logIntensity')
        .isIn([
            'Low', 
            'Moderate', 
            'High', 
            'Extreme'
        ])
        .withMessage('Invalid intensity level.')
];
