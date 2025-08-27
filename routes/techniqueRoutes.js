const path = require('path');
const express = require('express');
const techniqueController = require('../controllers/techniqueController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');

const router = express.Router();

router.get('/all', isAuthenticated, techniqueController.getAllTechniques)

router.get('/:techId/edit', isAuthenticated, techniqueController.getEditTechnique);
router.post('/:techId/edit', isAuthenticated, techniqueController.postEditTechnique)

module.exports = router;