const path = require('path');
const express = require('express');
const siteController = require('../controllers/publicController')

const router = express.Router();

router.get('/', siteController.getIndex);
router.get('/faqs', siteController.getFaqs);
router.get('/history', siteController.getHistory);
router.get('/philosophy', siteController.getPhilosophy);

module.exports = router;
