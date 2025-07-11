const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const { signupRules, loginRules } = require('../middleware/validators/authValidator');
const processAvatar = require('../middleware/uploadAvatarMiddleware');
const { csrfProtection, attachToken } = require('../middleware/csrfMiddleware');

const authController = require('../controllers/authController');

const router = express.Router();

router.get('/signup', csrfProtection, attachToken, authController.getSignup);
router.post('/signup', processAvatar, csrfProtection, signupRules, authController.postSignup);

router.get('/verify-email', authController.getVerifyEmail);

router.get('/check-email', authController.getCheckEmail);

router.get('/login', csrfProtection, attachToken, authController.getLogin);
router.post('/login', csrfProtection, loginRules, authController.postLogin);

router.get('/logout', authController.getLogout);

module.exports = router; 
