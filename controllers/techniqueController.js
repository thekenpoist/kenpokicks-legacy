const { Technique } = require('../models');
const { Op } = require('sequelize');
const { renderServerError } = require('../utils/errorrUtil')
const logger = require('../utils/loggerUtil');


exports.getAllTechniques = async (req, res, next) => {
    const user = res.locals.currentUser;
    
    if (!user) {
        return res.redirect('/auth/login')
    }

    try {
        const techniques = await Technique.findAll();

        if (techniques.length === 0) {
            return res.status(404).render('404', { 
                    pageTitle: "Techniques not found",
                    currentPage: 'portal/dashboard'
                });
        }

        res.render('all-techniques', {
            pageTitle: 'All Techniques',
            currentPage: 'techniques',
            layout: 'layouts/dashboard-layout',
            errorMessage: null,
            techniques
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
    const techniqueId = req.params.id;

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const technique = await Technique.findOne({
            where: { techID: techniqueId }
        })

        if (!technique) {
            return res.status(404).render('404', {
                pageTitle: 'Technique not found',
                currentPage: 'admin',
                layout: 'layouts/admin-layout'
            });
        }

        res.render('techniques/tech-form', {
            pageTitle: 'Edit Technique',
            currentPage: 'techniques',
            formAction: `/techniques/${techniqueId}/edit`,
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
}