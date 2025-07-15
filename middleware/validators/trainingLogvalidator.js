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
            'Weapons Practice'])
        .withMessage('Invalid category selected.'),
    body('logTitle')
        .trim()
        .isLength({ max: 50 }).withMessage('Title must be less than 50 characters.'),
    body('logDescription')
        .trim()
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters.'),
    body('logDuration')
            .isInt(),
    body('logRelatedBelt')
        .isIn([
            'Yellow', 
            'Orange', 
            'Purple',
            'Blue',
            'Green',
            'Brown',
            'Red',
            'Black/Red',
            'Black',
            'N/A'])
        .withMessage('Invalid belt selected'),
    body('logDate')
        .isISO8601().withMessage('Log date must be a valid date.')
        .toDate(),
    body('logIsPrivate'),
    body('logIntensity')
        .isIn([
            'Low', 
            'Moderate', 
            'High', 
            'Extreme'
        ])
];
