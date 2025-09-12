const path = require('path');
const express = require('express');
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const { body } = require('express-validator');
const { createTrainingLogRules } = require('../middleware/validators/trainingLogvalidator');
const trainingLogController = require('../controllers/trainingLogController');
const { verifyCsrfToken } = require('../middleware/csrfMiddleware');
const upload = multer();
const router = express.Router();

// Create
router.get('/new', isAuthenticated, trainingLogController.getCreateTrainingLog);
router.post('/', isAuthenticated, upload.none(), verifyCsrfToken, createTrainingLogRules, trainingLogController.postCreateTrainingLog);

// Read
router.get('/all', isAuthenticated, trainingLogController.getAllTrainingLogs)
router.get('/recent', isAuthenticated, trainingLogController.getRecentTrainingLogs);

// Update
router.get('/edit/:logId', isAuthenticated, trainingLogController.getEditTrainingLog);
router.post('/edit/:logId', isAuthenticated, upload.none(), verifyCsrfToken, createTrainingLogRules, trainingLogController.postEditTrainingLog);

// Delete
router.post('/delete/:logId', isAuthenticated, verifyCsrfToken, trainingLogController.deleteTrainingLog);

// Read one log
router.get('/:logId', isAuthenticated, trainingLogController.getOneTrainingLog);


module.exports = router;