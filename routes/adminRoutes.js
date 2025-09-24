const express = require('express');
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const requireRole = require('../middleware/requireRoleMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, requireRole('admin'), adminController.getAdminConsole);

router.get('/all', isAuthenticated, requireRole('admin'), adminController.getAllUsers)


module.exports = router;