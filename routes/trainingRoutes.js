const path = require('path');
const express = require('express');
const trainingController = require('../controllers/trainingController');
const techniqueController = require('../controllers/techniqueController')
const { isAuthenticated } = require('../middleware/auth/authMiddleware');

const router = express.Router();

router.get('/belt/:beltColor', isAuthenticated, techniqueController.getBeltTechniques);

router.get('/:beltColor/:section', isAuthenticated, trainingController.getSection);

module.exports = router;