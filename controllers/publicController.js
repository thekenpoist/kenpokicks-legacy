const { getFaqs } = require('../utils/faqUtil');
const { logger } = require('../utils/loggerUtil');


exports.getIndex = (req, res, next) => {
    res.render('index', { 
        pageTitle: 'Welcome to Kenpokicks ',
        showHomeLink: false
    });
};

exports.getHistory = (req, res, next) => {
    res.render('history', { 
        pageTitle: 'History of Kenpo',
        mainWidthClass: 'max-w-4x1',
        showHomeLink: true
    });
};

exports.getPhilosophy = (req, res, next) => {
    res.render('philosophy', { 
        pageTitle: 'AMTS Philosophy',
        mainWidthClass: 'max-w-4x1',
        showHomeLink: true
    });
};

exports.getFaqs = (req, res, next) => {
    try {
        const faqs = getFaqs();
        res.render('faqs', {
            pageTitle: 'Frequently Asked Questions',
            faqs,
            mainWidthClass: 'max-w-4x1',
            showHomeLink: true
        });
    } catch (err) {
        logger.error(`Error updating user: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
    }
};

