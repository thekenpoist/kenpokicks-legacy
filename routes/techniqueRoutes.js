const path = require('path');
const express = require('express');
const techniqueController = require('../controllers/techniqueController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const requireRole = require('../middleware/userRolesMiddleware');
const { verifyCsrfToken } = require('../middleware/csrfMiddleware');

const router = express.Router();

router.get('/all', isAuthenticated, requireRole('admin', 'superadmin'), techniqueController.getAllTechniques)

router.get('/:techId/edit', isAuthenticated, requireRole('admin', 'superadmin'), techniqueController.getEditTechnique);
router.post('/:techId/edit', isAuthenticated, verifyCsrfToken, requireRole('admin', 'superadmin'), techniqueController.postEditTechnique)

module.exports = router;