const { validationResult } = require('express-validator');
const { User, TrainingLog } = require('../models');
const { DATE } = require('sequelize');
const { renderServerError } = require('../utils/errorrUtil');
const { formatInTimeZone } = require('date-fns-tz');
const logger = require('../utils/loggerUtil');
const { lazy, use } = require('react');


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

    if (!errors.isEmpty()) {
        return res.status(422).render('logs/log-form', {
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
            user: uuid,
            logCategory,
            logTitle,
            logDescription,
            logDuration,
            logRelatedBelt,
            logDate,
            logIsPrivate,
            logIntensity
        });

        req.flash('success', 'Training log created successfully.');
        res.redirect(`/logs/${newLog.logId}`);

    } catch (err) {
        logger.error(`Error creating Log: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
        req.flash('error', 'There was a problem creating your training log entry.')
        res.status(500).render('logs/log-form', {
            pageTitle: 'Create New Training Log',
            currentPage: 'logs',
            formAction: '/logs',
            submitButtonText: 'Create Entry',
            errorMessage: 'Failed to create log',
            formData: req.body
        });
    }
}

exports.getOneTrainingLog = async (req, res, next) => {
    const user = res.locals.currentUser;
    const trainingLogId = req.params.logId;

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const trainingLog = await TrainingLog.findOne({
            where: {
                userUuid: user.uuid,
                logId: trainingLogId
            }
        });

        if (!trainingLog) {
            return res.status(404).render('404', {
                pageTitle: 'Training log not found',
                currentPage: 'dashboard'
            });
        }
        res.render('logs/show-log', {
            pageTitle: 'View Log',
            currentPage: 'log',
            errorMessage: null,
            trainingLog
        });
    } catch (err) {
        logger.error(`Error fetching training log: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'dashboard');
    }
};

exports.getAllTrainingLogs = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const allLogs = await TrainingLog.findAll({
            where: {
                userUuid: user.uuid,
                order: [['logDate', 'DESC']]
            }
        });

        res.render('logs/all-logs', {
            pageTitle: 'View Logs',
            currentPage: 'logs',
            errorMessage: null,
            allLogs
        });
    } catch (err) {
        logger.error(`Error fetching training log: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'dashboard');
    }

};

exports.getEditTrainingLog = async (req, res, next) => {
    const user = res.locals.currentUser;
    const trainingLogId = req.params.logId;

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const trainingLog = await TrainingLog.findOne({
            where: {
                userUuid: user.uuid,
                logId: trainingLogId
            }
        });

        if (!trainingLog) {
            return res.status(404).render('404', {
                pageTitle: 'Training log not found',
                currentPage: 'dashboard'
            });
        }

        res.render('logs/log-form', {
            pageTitle: 'Edit Training Log',
            currentPage: 'logs',
            formAction: `/logs/edit/${trainingLogId}`,
            submitButtonText: 'Save Changes',
            errorMessage: null,
            formData: trainingLog,
            csrfToken: req.csrfToken()

        });
    } catch (err) {
        logger.error(`Error fetching training log: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
        return renderServerError(res, err, 'dashboard');
    }
}

exports.postEditTrainingLog = async (req, res, next) => {
    const user = res.locals.currentUser;
    const trainingLogId = req.params.logId;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('logs/log-form', {
            pageTitle: 'Edit Training Log',
            currentPage: 'logs',
            formAction: `/logs/edit/${trainingLogId}`,
            submitButtonText: 'Save Changes',
            formData: req.body,
            errorMessage: errors.array().map(e => e.msg).join(', '),
            csrfToken: req.csrfToken()
        });
    }

    try {
        const trainingLog = await TrainingLog.findOne({
            where: {
                userUuid: user.uuid,
                logId: trainingLogId
            }
        });

        if (!trainingLog) {
            return res.status(404).render('404', {
                pageTitle: 'Training Log Not Found',
                currentPage: 'dashboard'
            });
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

        await TrainingLog.update({
            logCategory,
            logTitle,
            logDescription,
            logDuration,
            logRelatedBelt,
            logDate,
            logIsPrivate,
            logIntensity
        }, {
            where: {
                userUuid: user.uuid,
                logId: trainingLogId
            }
        });

        req.flash('success', 'Training log edited successfully.');
        res.redirect(`/logs/${trainingLogId}`);

    } catch (err) {
        logger.error(`Error creating Log: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
        return renderServerError(res, err, 'dashboard');
    }

};

exports.deleteTrainingLog = async (req, res, next) => {
    const user = res.locals.currentUser;
    const trainingLogId = req.params.logId;

    if (!user) {
        return res.redirect('/auth/login')
    }

    try {
        const deleted = await TrainingLog.destroy({
            where: {
                userUuid: user.uuid,
                logId: trainingLogId
            }
        });

        if (!deleted) {
            return res.status(404).render('404', {
                pageTitle: 'Training Log Not Found',
                currentPage: 'dashboard'
            });
        }

        req.flash('success', 'Training log deleted successfully')
        res.redirect('/dashboard');
    } catch (err) {
        logger.error(`Error Deleting Log: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'dashboard');

    }
};

