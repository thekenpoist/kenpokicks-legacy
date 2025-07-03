const path = require('path');
const express = require('express');
const techniqueController = require('../controllers/techniqueController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');

const router = express.Router();

router.get('/:beltColor', isAuthenticated, techniqueController.getBeltTechniques);

module.exports = router;