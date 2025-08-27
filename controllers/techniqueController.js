const { Technique } = require('../models');
const { validationResult } = require('express-validator');
const { renderServerError } = require('../utils/errorUtil')
const logger = require('../utils/loggerUtil');


exports.getAllTechniques = async (req, res, next) => {
    const user = res.locals.currentUser;
    
    if (!user) {
        return res.redirect('/auth/login')
    }

    try {
        const techniques = await Technique.findAll();
        const techniquesPlain = techniques.map(t => t.get({ plain: true }));

        if (techniques.length === 0) {
            return res.status(404).render('404', { 
                    pageTitle: "Techniques not found",
                    currentPage: 'admin'
                });
        }

        res.render('techniques/all-techniques', {
            pageTitle: 'All Techniques',
            currentPage: 'techniques',
            layout: 'layouts/admin-layout',
            errorMessage: null,
            techniques: techniquesPlain
        });
    } catch (err) {
        logger.error(`Error fetching techniques: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'portal/dashboard');
    }
}

exports.getEditTechnique = async (req, res, next) => {
    const user = res.locals.currentUser;
    if (!user) {
        return res.redirect('/auth/login');
    }

    const { techId } = req.params;

    try {
        const technique = await Technique.findByPk(techId);

        if (!technique) {
            return res.status(404).render('404', {
                pageTitle: 'Technique not found',
                currentPage: 'techniques',
                layout: 'layouts/admin-layout'
            });
        }

        res.render('techniques/tech-form', {
            pageTitle: 'Edit Technique',
            currentPage: 'techniques',
            formAction: `/techniques/${techId}/edit`,
            submitButtonText: 'Save Changes',
            errorMessage: null,
            layout: 'layouts/admin-layout',
            formData: technique.get({ plain: true })
        });
    } catch (err) {
        logger.error(`Error fetching technique: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'admin');
    }
};

exports.postEditTechnique = async (req, res, next) => {
    const user = res.locals.currentUser;
    if (!user) {
        return res.redirect('/auth/login');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(422).render('techniques/tech-form', {
            pageTitle: 'Edit Technique',
            currentPage: 'techniques',
            formAction: '/techniques',
            submitButtonText: 'Edit Technique',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body
        });
    }

    const {
        techTitle,
        techSlug,
        techAttack,
        techDescription,
        techGroup,
        techAttackAngle,
        techNotes,
        relatedForm,
        beltColor,
        videoUrl,
        lastUpdatedBy
    } = req.body;
    
    const { techId } = req.params;
    try {
        const technique = await Technique.findOne({
            where: { techId }
        });

        if (!technique) {
            return res.status(404).render('404', {
                pageTitle: 'Technique Not Found',
                currentPage: 'techniques'
            });
        }

        await Technique.update({
            techTitle,
            techSlug,
            techAttack,
            techDescription,
            techGroup,
            techAttackAngle,
            techNotes,
            relatedForm,
            beltColor,
            videoUrl,
            lastUpdatedBy
        }, {
            where: { techId }
        });
    } catch (err) {
        logger.error(`Error updating user: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        res.status(500).render('techniques/tech-form', {
            pageTitle: 'Edit Technique',
            currentPage: 'techniques',
            errorMessage: 'Something went wrong. Please try again.',
            formData: req.body
        });
    }
}