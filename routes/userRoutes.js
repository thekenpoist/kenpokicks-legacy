const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const { validateProfileUpdate } = require('../middleware/validators/userValidator')
const processAvatar = require('../middleware/uploadAvatarMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/edit-profile', isAuthenticated, userController.getEditProfile);
router.post('/edit-profile', isAuthenticated, processAvatar, validateProfileUpdate, userController.postEditProfile);

router.get('/me', userController.getShowProfile);

module.exports = router;