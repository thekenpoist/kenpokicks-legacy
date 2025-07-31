const path = require('path');
const express = require('express');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');
const { body } = require('express-validator');
const { createTrainingLogRules } = require('../middleware/validators/trainingLogvalidator');
const trainingLogController = require('../controllers/trainingLogController');

const router = express.Router();

// Create
router.get('/new', isAuthenticated, trainingLogController.getCreateTrainingLog);
router.post('/', isAuthenticated, createTrainingLogRules, trainingLogController.postCreateTrainingLog);

// Read
router.get('/logs/:logId', isAuthenticated, trainingLogController.getOneTrainingLog);
router.get('/logs', isAuthenticated, trainingLogController.getAllTrainingLogs)

// Update
router.get('/edit/:logId', isAuthenticated, trainingLogController.getEditTrainingLog);
router.post('/edit/:logId', isAuthenticated, createTrainingLogRules, trainingLogController.postEditTrainingLog);

// Delete
router.post('/delete/:logId', isAuthenticated, trainingLogController.deleteTrainingLog);

module.exports = router;