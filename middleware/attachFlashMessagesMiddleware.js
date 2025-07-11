module.exports = (req, res, next) => {
    res.locals.messages = {
        info: req.flash('info') || [],
        error: req.flash('error') || [],
        success: req.flash('success') || []
    };
    next();
};