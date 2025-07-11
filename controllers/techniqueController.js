const { Technique } = require('../models');
const { Op } = require('sequelize');
const { renderServerError } = require('../utils/errorrUtil')
const logger = require('../utils/loggerUtil');

exports.getBeltTechniques = async (req, res, next) => {
    const beltColor = req.params.beltColor;
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const techniques = await Technique.findAll({
            where: { beltColor }
        });

        if (techniques.length === 0) {
            return res.status(404).render('404', { 
                pageTitle: "Techniques not found",
                currentPage: 'portal/dashboard'
            });
        }

        res.render('training/techniques-template', {
            pageTitle: `Techniques for ${beltColor}`,
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
};