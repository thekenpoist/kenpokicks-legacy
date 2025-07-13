const csrf = require('csurf');
const logger = require('winston');

const csrfProtection = csrf();

const attachToken = (req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (err) {
    // In case csrf() wasn't initialized or token couldn't be generated
    logger.error(`Failed to attach CSRF token: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
  }
  next();
};

module.exports = {
  csrfProtection,
  attachToken
};
