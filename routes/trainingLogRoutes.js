const path = require('path');
const express = require('express');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const { body } = require('express-validator');
const { createTrainingLogRules } = require('../middleware/validators/trainingLogvalidator');
const { csrfProtection, attachToken } = require('../middleware/csrfMiddleware');
const trainingLogController = require('../controllers/trainingLogController');

const router = express.Router();

// Create
router.get('/new', isAuthenticated, csrfProtection, attachToken, trainingLogController.getCreateTrainingLog);
router.post('/', isAuthenticated, csrfProtection, createTrainingLogRules, trainingLogController.postCreateTrainingLog);



module.exports = router;