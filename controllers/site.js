exports.getIndex = (req, res, next) => {
    res.render('index', { title: 'Welcome to Kenpokicks '});
};

exports.getFaqs = (req, res, next) => {
    res.render('faqs', {title: 'Frequently Asked Questions' });
}