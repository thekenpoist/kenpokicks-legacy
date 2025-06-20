const { getFaqs } = require('../utils/faqUtils');


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
        console.error('Error reading faqs:', err);
        next(err);
    }
};

