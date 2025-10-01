const express = require('express');
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const requireRole = require('../middleware/requireRoleMiddleware');
const processAvatar = require('../middleware/uploadAvatarMiddleware');
const { verifyCsrfToken } = require('../middleware/csrfMiddleware');

const router = express.Router();

router.use((req, _res, next) => { console.log('[adminRouter]', req.method, req.originalUrl); next(); });


router.get('/', isAuthenticated, requireRole('admin'), adminController.getAdminConsole);

router.get('/all', isAuthenticated, requireRole('admin'), adminController.getAllUsers)

router.get('/users/:uuid/edit', isAuthenticated, requireRole('admin'), adminController.getEditUser);
router.post('/users/:uuid/update', isAuthenticated, processAvatar, verifyCsrfToken, requireRole('admin'), adminController.postEditUser);


module.exports = router;