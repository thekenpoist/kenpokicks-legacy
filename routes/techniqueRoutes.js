const path = require('path');
const express = require('express');
const techniqueController = require('../controllers/techniqueController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');

const router = express.Router();

router.get('/all', isAuthenticated, techniqueController.getAllTechniques)

router.get('/:id/edit', isAuthenticated, techniqueController.getEditTechnique);

module.exports = router;