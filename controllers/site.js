const siteModel = require('../models/site');



exports.getIndex = (req, res, next) => {
    res.render('index', { title: 'Welcome to Kenpokicks '});
};


exports.getFaqs = (req, res, next) => {
    try {
        const faqs = siteModel.getFaqs();
        res.render('faqs', {
            pageTitle: 'Frequently Asked Questions',
            faqs
        });
    } catch (err) {
        console.error('Error reading faqs:', err);
        res.status(500).render('error', { 
            pageTitle: 'Server Error',
            statusCode: 500,
            message: 'Something went wrong while loading the FAQ page',
            error: err,
            showStack: process.env.NODE_END !== 'production'
         });
    }
};