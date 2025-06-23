const { User } = require('../../models');

module.exports = async function setCurrentUser(req, res, next) {
    res.locals.currentPage = '';
    res.locals.currentUser = null;
    res.locals.layout = 'layouts/main-layout';
    res.locals.session = req.session;

    const uuid = req.session.userUuid;

    if (uuid) {
        try {
            const user = await User.findOne({ where: { uuid } });
            if (user) {
                res.locals.currentUser = user;
                res.locals.layout = 'layouts/dashboard-layout';
            }
        } catch (err) {
            console.error('Error loading current user from session:', err);
            res.locals.currentUser = null;
        }
    }

    next();
};