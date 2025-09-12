const crypto = require('crypto');

function createCsrfToken(req, res, next) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(24).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next()
}

function verifyCsrfToken(req, res, next) {
    const token = req.body._csrf || req.headers['x-csrf-token'];
    if (token && token === req.session.csrfToken) {
        return next();
    }
    res.status(403).send('Invalid CSRF token');
}

module.exports = { createCsrfToken, verifyCsrfToken };