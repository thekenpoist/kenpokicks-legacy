const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const { validateProfileUpdate } = require('../middleware/validators/userValidator')
const processAvatar = require('../middleware/uploadAvatarMiddleware');
const { verifyCsrfToken } = require('../middleware/csrfMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/edit-profile', isAuthenticated, userController.getEditProfile);
router.post('/edit-profile', isAuthenticated, processAvatar, verifyCsrfToken, validateProfileUpdate, userController.postEditProfile);

router.post('/delete-profile', isAuthenticated, verifyCsrfToken, userController.deleteProfile);

router.get('/me', userController.getShowProfile);

module.exports = router;