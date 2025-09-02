const { body } = require('express-validator');

exports.editTechniqueRules = [
    body('techTitle')
        .trim()
        .notEmpty().withMessage('A title is required'),
    body('techSlug')
        .trim()
        .notEmpty().withMessage('A slug is required')
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage('Slug must be lowercase, numbers, and dashes only'),
    body('techAttack')
        .trim()
        .notEmpty().withMessage('An attack is required'),
    body('techDescription')
        .notEmpty().withMessage('A description is required')
        .custom(value => {
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
        ])
        .withMessage('Group must be one of the defined levels'),
    body('techAttackAngle')
        .matches(/^(?:[1-9]|1[0-2]):(?:00|30)$/)
        .withMessage("Attack angle must be in the format H:00 or H:30 (e.g., '1:00', '2:30', '12:00')"),
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
        ])
        .withMessage('Invalid belt color'),
    body('videoUrl')
        .optional()
        .trim()
        .isURL().withMessage('Must be a valid URL'),
    // handled server-side usually
    body('lastUpdatedBy')
        .optional()
        .trim(),
];