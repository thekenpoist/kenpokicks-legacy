const { body } = require('express-validator');

exports.editTechniqueRules = [
    body('techTitle')
        .trim()
        .notEmpty().withMessage('A title is required'),
    body('techSlug')
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .trim()
        .notEmpty().withMessage('Slug must be lowercase, numbers, and dashes only'),
    body('techAttack')
        .trim()
        .notEmpty().withMessage('An attack is required'),
    body('techDescription')
        .custum(value => {
            try {
                JSON.parse(value);
                return true;
            } catch (e) {
                throw new Error('Description must be valid JSON')
            }
        }),
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
        .trim()
        .isURL().withMessage('Must be a valid URL'),
    body('lastUpdatedBy')
        .trim()
        .notEmpty().withMessage('This field must not be empty'),
];