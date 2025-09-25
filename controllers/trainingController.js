const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/loggerUtil');
const { Technique } = require('../models');


exports.getSection = async (req, res) => {
    const { beltColor, section } = req.params;
    const filePath = path.join(__dirname, '..', 'data', 'curriculum', beltColor, `${beltColor}_${section}.json`);

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.render(`training/${section}-template`, {
            beltColor,
            content: data
        });
    } catch (err) {
        logger.error(`Error updating user: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        res.status(404).render('404', { message: 'Section not found.'});
    }
};

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