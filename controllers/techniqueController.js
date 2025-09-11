const { Technique } = require('../models');
const { validationResult } = require('express-validator');
const { renderServerError } = require('../utils/errorUtil')
const logger = require('../utils/loggerUtil');
const { techAttackAngle, beltColor, techGroup } = require('../utils/constants');


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

    if (!user || !['admin'].includes(user.role)) {
        return res.status(403).render('403', {
            pageTitle: 'Access Denied',
            currentPage: 'portal/dashboard',
            layout:'layouts/dashboard-layout'
        })
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
            techAttackAngle,
            beltColor,
            techGroup,
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
    
    if (!user || !['admin'].includes(user.role)) {
        return res.status(403).render('403', {
            pageTitle: 'Access Denied',
            currentPage: 'portal/dashboard',
            layout:'layouts/dashboard-layout'
        })
    }

    const { techId } = req.params;

    const formAction = `/techniques/${techId}/edit`;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('techniques/tech-form', {
            pageTitle: 'Edit Technique',
            currentPage: 'techniques',
            formAction,
            layout: 'layouts/admin-layout',
            submitButtonText: 'Save Changes',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body
        });
    }

    let {
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

    let techDescriptionParsed = null;
    try {
        techDescriptionParsed = techDescription ? JSON.parse(techDescription) : null;
    } catch (e) {
        return res.status(422).render('techniques/tech-form', {
            pageTitle: 'Edit Technique',
            currentPage: 'techniques',
            formAction,
            layout: 'layouts/admin-layout',
            submitButtonText: 'Save Changes',
            errorMessage: 'Description must be valid JSON',
            formData: req.body
        }); 
    }
    
    try {
        const technique = await Technique.findByPk(techId)
        if (!technique) {
            return res.status(404).render('404', {
                pageTitle: 'Technique Not Found',
                currentPage: 'techniques',
                layout: 'layouts/admin-layout'
            });
        }

        await Technique.update({
            techTitle,
            techSlug,
            techAttack,
            techDescription: techDescriptionParsed,
            techGroup,
            techAttackAngle,
            techNotes,
            relatedForm,
            beltColor,
            videoUrl: videoUrl || null,
            lastUpdatedBy: lastUpdatedBy || user?.username || null
        },{
            where: { techId }
        });

        return res.redirect('/techniques/all');
    } catch (err) {

        const isUnique = err?.name === 'SequelizeUniqueConstraintError' || err?.original?.code === 'ER_DUP_ENTRY';

        if (isUnique) {
            return res.status(422).render('techniques/tech-form', {
                pageTitle: 'Edit Technique',
                currentPage: 'techniques',
                layout: 'layouts/admin-layout',
                formAction,
                submitButtonText: 'Save Changes',
                errorMessage: 'Title or Slug must be unique.',
                formData: req.body
            })
        }

        logger.error(`Error updating technique: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        return res.status(500).render('techniques/tech-form', {
                pageTitle: 'Edit Technique',
                currentPage: 'techniques',
                layout: 'layouts/admin-layout',
                formAction,
                submitButtonText: 'Save Changes',
                errorMessage: 'Something went wrong. Please try again.',
                formData: req.body
            });
    }
};