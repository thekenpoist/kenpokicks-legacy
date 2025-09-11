const path = require('path');
const express = require('express');
const techniqueController = require('../controllers/techniqueController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const requireRole = require('../middleware/requireRoleMiddleware');

const router = express.Router();

router.get('/all', isAuthenticated, requireRole('admin'), techniqueController.getAllTechniques)

router.get('/:techId/edit', isAuthenticated, requireRole('admin'), techniqueController.getEditTechnique);
router.post('/:techId/edit', isAuthenticated, requireRole('admin'), techniqueController.postEditTechnique)

module.exports = router;