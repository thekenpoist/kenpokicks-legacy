const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');

router.get('/dashboard', isAuthenticated, portalController.getDashboard);


module.exports = router;