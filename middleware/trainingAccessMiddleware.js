function verifyRankLevel(beltRank) {
    const belt = await Belt.findOne({ where: { beltSlug } });
    
        if (!belt) {
            return res.status(404).render('404', { pageTitle: 'Not Found' });
        }
    
        const elevatedRoles = ['instructor', 'admin', 'superadmin' ];
            const isElevated = elevatedRoles.includes(user.role);
    
            if (!isElevated) {
                const userBelt = await Belt.findOne({ where: { beltColor: user.rank } });
                if (!userBelt) {
                    req.flash('error', 'Your belt level is not set. Please contact your instructor.');
                    return res.redirect('/portal/dashboard');
                }
                
                const maxAllowedRank = userBelt.beltRankOrder +1;
    
                if (belt.beltRankOrder > maxAllowedRank) {
                    req.flash('error', 'This curriculum is not available at your rank.')
                    return res.redirect('/portal/dashboard')
                }
            }
}