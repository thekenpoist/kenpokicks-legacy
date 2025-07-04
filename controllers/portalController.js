const { Belt } = require('../models')
const { Sequelize } = require('sequelize');

exports.getDashboard = async (req, res, next) => {
    const user = res.locals.currentUser;
    

    const belts = [
      { name: 'Yellow Belt', slug: 'yellow' },
      { name: 'Orange Belt', slug: 'orange' },
      { name: 'Purple Belt', slug: 'purple' },
      { name: 'Blue Belt', slug: 'blue' },
      { name: 'Green Belt', slug: 'green' },
      { name: 'Brown Belt', slug: 'brown' },
      { name: 'Red Belt', slug: 'red' },
      { name: 'Black/Red Belt', slug: 'blackred' },
      { name: 'Black Belt', slug: 'black' }
    ]

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
        user: res.locals.currentUser,
        lastLoggedInFormatted,
        showHomeLink: false
    });
};