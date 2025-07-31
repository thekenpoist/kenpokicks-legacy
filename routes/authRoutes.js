const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const { signupRules, loginRules } = require('../middleware/validators/authValidator');
const processAvatar = require('../middleware/uploadAvatarMiddleware');

const authController = require('../controllers/authController');

const router = express.Router();

router.get('/signup', authController.getSignup);
router.post('/signup', processAvatar, signupRules, authController.postSignup);

router.get('/verify-email', authController.getVerifyEmail);

router.get('/check-email', authController.getCheckEmail);

router.get('/login', authController.getLogin);
router.post('/login', loginRules, authController.postLogin);

router.get('/logout', authController.getLogout);

module.exports = router; 
