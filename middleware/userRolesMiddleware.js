function requireRole(...allowed) {
    return (req, res, next) => {
        const user = res.locals.currentUser || req.user ||null;

        if (!user) {
            if (req.accepts('html')) return res.redirect('/auth/login');
            return res.status(401).json({ error: 'Not Authenticated' });
        }

        if (!allowed.includes(user.role)) {
            if (req.accepts('html')) {
                return res.status(403).render('403', {
                    pageTitle: 'Access Denied',
                    currentPage: 'portal/dashboard',
                    layout: 'layouts/dashboard-layout'
                });
            }
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    };
};

module.exports = requireRole;