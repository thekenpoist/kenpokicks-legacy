const express = require('express');
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const requireRole = require('../middleware/requireRoleMiddleware');
const processAvatar = require('../middleware/uploadAvatarMiddleware');
const { verifyCsrfToken } = require('../middleware/csrfMiddleware');
const { validateUserUpdate } = require('../middleware/validators/adminValidator');

const router = express.Router();

router.get('/', isAuthenticated, requireRole('admin', 'superadmin'), adminController.getAdminConsole);

router.get('/all', isAuthenticated, requireRole('admin'), adminController.getAllUsers)

router.get('/users/:uuid/show', isAuthenticated, requireRole('admin'), adminController.getOneUser);

router.get('/logs/recent', isAuthenticated, requireRole('admin'), adminController.getRecentAdminLogs);
router.get('/logs', isAuthenticated, requireRole('admin'), adminController.getAllAdminLogs);

router.get('/users/:uuid/edit', isAuthenticated, requireRole('admin'), adminController.getEditUser);
router.post('/users/:uuid/update', isAuthenticated, processAvatar, verifyCsrfToken, validateUserUpdate, requireRole('admin'), adminController.postEditUser);


module.exports = router;