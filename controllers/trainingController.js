const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/loggerUtil');
const { Technique, Belt } = require('../models');

function loadJson(p) {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}


exports.getBeltCurriculum = async (req, res) => {
    try { 
        const user = res.locals.currentUser;
        if (!user) {
            return res.redirect('/auth/login');
        }

        const { beltColor, section } = req.params;
        
        const requestedBelt = await Belt.findOne({ where: { beltColor } });
        if (!requestedBelt) {
            return res.status(404).render('404', { pageTitle: 'Belt not found' });
        }

        const elevatedRoles = ['instructor', 'admin', 'superadmin' ];
        const isElevated = elevatedRoles.includes(user.role);

        if (!isElevated) {
            const userBelt = await Belt.findOne({ where: { beltColor: user.rank } });
            if (!userBelt) {
                req.flash('error', 'Your belt level is not set. Please contact your instructor.');
                return res.redirect('/portal/dashboard');
            }
            
            const maxAllowedRank = userBelt.beltRankOrder +1;

            if (requestedBelt.beltRankOrder > maxAllowedRank) {
                req.flash('error', 'This curriculum is not available at your rank.')
                return res.redirect('/portal/dashboard')
            }
        }

        const ALLOWED_SECTIONS = new Set(['techniques', 'basics', 'forms', 'sets']);
        if (!ALLOWED_SECTIONS.has(section)) {
            return res.status(404).render('404', { message: 'Section not found.' });
        }

        const filePath = path.join(__dirname, '..', 'data', 'curriculum', beltColor, `${beltColor}_${section}.json`);

    
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
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    const beltSlug = req.params.beltSlug;
    const belt = await Belt.findOne({ where: { beltSlug } });

    if (!belt) {
        return res.status(404).render('404', { pageTitle: 'Not Found' });
    }

    try {
        const techniques = await Technique.findAll({
            where: { beltColor: belt.beltColor }
        });

        if (techniques.length === 0) {
            return res.status(404).render('404', { 
                pageTitle: "Techniques not found",
                currentPage: 'portal/dashboard'
            });
        }

        res.render('training/techniques-template', {
            pageTitle: `Techniques for ${belt.beltColor}`,
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

exports.getAdvancedForm = async (req, res) => {
    const formNumber = String(req.params.formNumber);

    const filePath = path.join(__dirname, '..', 'data', 'curriculum', 'advanced_forms', `form_${formNumber}.json`);

    try {
        const formData = loadJson(filePath);

        const dataSource = Array.isArray(formData.forms) && formData.forms.length
            ? formData.forms[0]
            : formData;

        const viewModel = {
            pageTitle: dataSource.name || `Form ${formNumber}`,
            forms: [
                {
                    name: dataSource.name || `Form ${formNumber}`,
                    beltSlug: dataSource.beltSlug || 'advanced',
                    intro: dataSource.intro || '',
                    sets: dataSource.sets || [],
                    title: dataSource.title || '',
                    steps: dataSource.steps || [],
                    footerNotes: dataSource.footerNotes || ''
                }
            ]
        }
        return res.render(`training/forms-template`, viewModel);

    } catch (err) {
        logger.error(`Error loading Form ${formNumber}: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
    }
};

exports.getHeritageSet = async (req, res) => {
    const setName = String(req.params.setName);

    const filePath = path.join(__dirname, '..', 'data', 'curriculum', 'heritage_sets', `${setName}.json`);

    try {
        const setData = loadJson(filePath);

        const dataSource = Array.isArray(setData.sets) && setData.sets.length
            ? setData.sets[0]
            : setData;

        const viewModel = {
            pageTitle: dataSource.name || setName,
            content: { sets: [
                {
                    name: dataSource.name || setName,
                    beltSlug: dataSource.beltSlug || 'heritage',
                    intro: dataSource.intro || '',
                    sets: dataSource.sets || [],
                    title: dataSource.title || '',
                    steps: dataSource.steps || [],
                    footerNotes: dataSource.footerNotes || ''
                }
            ]}
        }
        return res.render(`training/sets-template`, viewModel);

    } catch (err) {
        logger.error(`Error loading ${setName}: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
    }
};