const path = require('path');
const express = require('express');
const siteController = require('../controllers/site')

const router = express.Router();

router.get('/', siteController.getIndex);
router.get('faqs', siteController.getFaqs);

module.exports = router;
