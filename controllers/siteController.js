const siteModel = require('../models/siteModel');



exports.getIndex = (req, res, next) => {
    res.render('index', { 
        pageTitle: 'Welcome to Kenpokicks '
    });
};

exports.getHistory = (req, res, next) => {
    res.render('history', { 
        pageTitle: 'History of Kenpo',
        mainWidthClass: 'max-w-4x1'
    });
};


exports.getFaqs = (req, res, next) => {
    try {
        const faqs = siteModel.getFaqs();
        res.render('faqs', {
            pageTitle: 'Frequently Asked Questions',
            faqs,
            mainWidthClass: 'max-w-4x1'
        });
    } catch (err) {
        console.error('Error reading faqs:', err);
        next(err);
    }
};

