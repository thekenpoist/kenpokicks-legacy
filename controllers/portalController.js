const { Belt } = require('../models')
const { Sequelize } = require('sequelize');

exports.getDashboard = async (req, res, next) => {
    const user = res.locals.currentUser;
    let belts;

    try {
        belts = await Belt.getAllOrdered();

        if (!belts) {
            return res.status(404).render('404', {
                pageTitle: "Belts not found",
                currentPage: 'portal/dashboard'
            });
        }
    } catch (err) {
        logger.error(`Error fetching belts: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
    }

    const lastLoggedInFormatted = user?.lastLoggedIn
        ? new Date(user.lastLoggedIn).toLocaleString('en-us', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        : 'N/A';

    res.render('portal/dashboard', { 
        belts,
        pageTitle: 'Training Dashboard',
        currentPage: 'dashboard',
        user,
        lastLoggedInFormatted,
        showHomeLink: false
    });
};