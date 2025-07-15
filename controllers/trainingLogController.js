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
        csrfToken: req.csrfToken(),
        formData: {
            user: res.locals.currentUser || ''
        }
    });
};

exports.postCreateTrainingLog = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty) {
        return res.status(422).render('logs/new-log', {
            pageTitle: 'Create Entry',
            currentPage: 'logs',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body
        });
    }

    const user = res.locals.currentUser;
    if (!user) {
        return res.redirect('/auth/login');
    }

    const {
        logCategory,
        logTitle,
        logDescription,
        logDuration,
        logRelatedBelt,
        logDate,
        logIsPrivate,
        logIntensity
    } = req.body;

    try {
        const newLog = await TrainingLog.create({
            user: userUuid,
            logCategory,
            logTitle,
            logDescription,
            logDuration,
            logRelatedBelt,
            logDate,
            logIsPrivate,
            logIntensity
        });
        res.redirect('/dashboard');
    } catch (err) {
        logger.error(`Error creating Log: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
        res.status(500).render('logs/new-log', {
            pageTitle: 'Create New Training Log',
            currentPage: 'logs',
            formAction: '/logs',
            submitButtonText: 'Create Entry',
            errorMessage: 'Failed to create log',
            formData: req.body
        });

    }

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

