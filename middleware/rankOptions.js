const { beltColor } = require('../utils/constants');

module.exports = (req, res, next) => {
    res.locals.ranks = beltColor;
    next();
}