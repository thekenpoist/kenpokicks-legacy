const logger = require('../utils/loggerUtil');

function logoutAndRedirect(req, res, redirectPath, queryParam = '') {
    req.session.destroy(err => {
        if (err) {
            logger.error(`Error destroying session: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
            return res.redirect(redirectPath);
        }

        const separator = redirectPath.includes('?') ? '&' : '?';
        const fullRedirect = queryParam
            ? `${redirectPath}${separator}${queryParam}`
            : redirectPath;

        res.clearCookie('connect.sid');
        res.redirect(fullRedirect);
    });
}

module.exports = { logoutAndRedirect };