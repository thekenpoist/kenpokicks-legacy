const { validationResult } = require('express-validator');
const { User, TrainingLog } = require('../models');
const { DATE } = require('sequelize');
const { renderServerError } = require('../utils/errorrUtil');
const { formatInTimeZone } = require('date-fns-tz');
const logger = require('../utils/loggerUtil');


exports.getCreateTrainingLog = (req, res, next) => {
    res.render('logs/log-form', {
        pageTitle: 'Create New Training Log',
        currentPage: 'logs',
        formAction: '/logs',
        submitButtonText: 'Create Entry',
        errorMessage: null,
        crsfToken: req.crsfToken,
        formData: {
            user: req.locals.currentUser || ''
        }
    });
};

exports.postCreateTrainingLog = async (req, res, next) => {

}





exports.getShowTrainingLogs = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }
}


exports.getTrainingLog = async (req, res, next) => {

}

exports.getAllTrainingLogs = async (req, res, next) => {

}



exports.getEditTrainingLog = async (req, res, next) => {

}

exports.postEditTrainingLog = async (req, res, next) => {

}

exports.deleteTrainingLog = async (req, res, next) => {

}

