function renderServerError(res, err, currentPage = 'dashboard') {
    return res.status(500).render('500', {
        pageTitle: 'Server Error',
        currentPage,
        message: err?.message || 'Something went wrong', err,
        showstack: process.env.NODE_ENV !== 'production'
    });
}

module.exports = { renderServerError };