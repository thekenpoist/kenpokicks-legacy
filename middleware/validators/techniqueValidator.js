const { body } = require('express-validator');

exports.editTechniqueRules = [
    body('techTitle')
        .trim()
        .notEmpty().withMessage('A title is required'),
    body('techSlug')
        .trim()
        .notEmpty().withMessage('A slug is required'),
    body('techAttack')
        .trim()
        .notEmpty().withMessage('An attack is required'),
    body('techDescription')
        .trim()
        .notEmpty().withMessage('A description is required and must be in JSON format'),
    body('techGroup')
        .isIn([
            'Beginner',
            'Intermediate',
            'Advanced',
            'Expert'
        ]),
    body('techAttackAngle'),
    // Ace, how would I make sure that this is in the correct format of the clock?
    body('techNotes')
        .optional()
        .trim(),
    body('relatedForm')
        .optional()
        .trim(),
    body('beltColor')
        .isIn([
            'Yellow',
            'Orange',
            'Purple',
            'Blue',
            'Green',
            'Brown',
            'Red',
            'Black/Red',
            'Black'
        ]),
    body('videoUrl')
        .optional()
        .trim(),
    body('lastUpdatedBy')
        .trim()
        .notEmpty().withMessage('This field must not be empty'),
];