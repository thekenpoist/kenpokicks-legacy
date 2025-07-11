const csrf = require('csurf');

const csrfProtection = csrf();

const attachToken = (req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (err) {
    // In case csrf() wasn't initialized or token couldn't be generated
    console.error("⚠️ Failed to attach CSRF token:", err.message);
  }
  next();
};

module.exports = {
  csrfProtection,
  attachToken
};
