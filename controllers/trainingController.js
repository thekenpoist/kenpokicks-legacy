const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/loggerUtil');
const { Technique } = require('../models');


exports.getSection = async (req, res) => {
    const { beltColor, section } = req.params;
    const ALLOWED_SECTIONS = new Set(['techniques', 'basics', 'forms', 'sets']);
    if (!ALLOWED_SECTIONS.has(section)) {
        return res.status(404).render('404', { message: 'Section not found.' });
    }

    const filePath = path.join(__dirname, '..', 'data', 'curriculum', beltColor, `${beltColor}_${section}.json`);

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.render(`training/${section}-template`, {
            beltColor,
            section,
            content: typeof data === 'object' && !Array.isArray(data) ? data : { [section]: data },
            hasData: Array.isArray(data) ? data.length > 0 : !!data
        });
    } catch (err) {
        if (err.code === 'ENOENT' && ALLOWED_SECTIONS.has(section)) {
            return res.render(`training/${section}-template`, { 
                beltColor,
                section,
                content: { [section]: [] },
                hasData: false
        })
        }
        logger.error(`Error loading curriculum for ${beltColor}/${section}: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        res.status(ALLOWED_SECTIONS.has(section) ? 500 : 404)
            .render(ALLOWED_SECTIONS.has(section) ? '500' : '404', { message: 'Problem loading this section.'});
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