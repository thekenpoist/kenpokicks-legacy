const path = require('path');
const express = require('express');
const trainingController = require('../controllers/trainingController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');

const router = express.Router();

router.get('/:beltColor/:section', isAuthenticated, trainingController.getSection);

module.exports = router;