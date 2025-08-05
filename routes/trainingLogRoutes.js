const path = require('path');
const express = require('express');
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const { body } = require('express-validator');
const { createTrainingLogRules } = require('../middleware/validators/trainingLogvalidator');
const trainingLogController = require('../controllers/trainingLogController');
const upload = multer();
const router = express.Router();

// Create
router.get('/new', isAuthenticated, trainingLogController.getCreateTrainingLog);
router.post('/', isAuthenticated, upload.none(), createTrainingLogRules, trainingLogController.postCreateTrainingLog);

// Read
router.get('/:logId', isAuthenticated, trainingLogController.getOneTrainingLog);
router.get('/all', isAuthenticated, trainingLogController.getAllTrainingLogs)

// Update
router.get('/edit/:logId', isAuthenticated, trainingLogController.getEditTrainingLog);
router.post('/edit/:logId', isAuthenticated, createTrainingLogRules, trainingLogController.postEditTrainingLog);

// Delete
router.post('/delete/:logId', isAuthenticated, trainingLogController.deleteTrainingLog);

module.exports = router;