exports.getIndex = (req, res, next) => {
    res.render('index', { title: 'Welcome to Kenpokicks '});
};