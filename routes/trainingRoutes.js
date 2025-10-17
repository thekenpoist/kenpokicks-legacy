const path = require('path');
const express = require('express');
const trainingController = require('../controllers/trainingController');
const { isAuthenticated } = require('../middleware/auth/authMiddleware');

const router = express.Router();

router.get('/belt/:beltColor', isAuthenticated, trainingController.getBeltTechniques);

router.get('/:beltColor/:section', isAuthenticated, trainingController.getBeltCurriculum);

router.get('/advanced/forms/:formNumber', isAuthenticated, trainingController.getAdvancedForm);


module.exports = router;