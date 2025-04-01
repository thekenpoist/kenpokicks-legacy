const path = require('path');
const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index', { title: 'Welcome to Kenpokicks '});
});

module.exports = router;
