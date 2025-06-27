const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const { editUserRules, updateSettingsRules } = require('../middleware/validators/userValidator')
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/edit-profile', isAuthenticated, userController.getEditProfile);
router.post('/edit-profile', isAuthenticated, editUserRules, updateSettingsRules, userController.postEditProfile);

module.exports = router;