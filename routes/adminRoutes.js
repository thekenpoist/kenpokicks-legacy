const express = require('express');
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');

const router = express.Router();


router.get('/', isAuthenticated, adminController.getAdminConsole);


module.exports = router;