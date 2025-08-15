const express = require('express');
const adminController = require('../controllers/adminController');
const { isauthenticated } = require('../middleware/auth/authMiddleware');

const router = express.Router();


router.get('/admin', isauthenticated, adminController.getAdminConsole);


module.exports = router;