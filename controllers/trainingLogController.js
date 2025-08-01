const { validationResult } = require('express-validator');
const { User, TrainingLog } = require('../models');
const { DATE } = require('sequelize');
const { renderServerError } = require('../utils/errorrUtil');
const { formatInTimeZone } = require('date-fns-tz');
const logger = require('../utils/loggerUtil');

exports.getCreateTrainingLog = (req, res, next) => {
    res.render('training-logs/log-form', {
        pageTitle: 'Create New Training Log',
        currentPage: 'logs',
        formAction: '/logs',
        submitButtonText: 'Create Entry',
        errorMessage: null,
        layout: false,
        formData: {
            user: res.locals.currentUser || ''
        }
    });
};

exports.postCreateTrainingLog = async (req, res, next) => {
    console.log("Is it making it here?")

    const errors = validationResult(req);

    const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

    if (!errors.isEmpty()) {
        if (isAjax) {
            return res.status(422).json({
                success: false,
                errors: errors.array()
            });
        }
        return res.status(422).render('training-logs/log-form', {
            pageTitle: 'Create Entry',
            currentPage: 'logs',
            formAction: '/logs',
            submitButtonText: 'Create Entry',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body
        });
    }

    const user = res.locals.currentUser;
    if (!user) {
        return req.xhr
            ? res.status(401).json({ success: false, error: 'Unauthorized' })
            : res.redirect('/auth/login');
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

    console.log("Creating log for user:", {
        uuid: user.uuid,
        title: logTitle,
        category: logCategory
    });

    try {
        const newLog = await TrainingLog.create({
            userUuid: user.uuid,
            logCategory,
            logTitle,
            logDescription,
            logDuration,
            logRelatedBelt,
            logDate,
            logIsPrivate,
            logIntensity
        });

        if (req.xhr) {
            return res.status(201).json({
                success: true,
                log: newLog
            });
        }

        req.flash('success', 'Training log created successfully.');
        res.redirect(`/logs/${newLog.logId}`);

    } catch (err) {
        logger.error(`Error creating Log: ${err.message}`);
            if (req.xhr) {
                return res.status(500).json({ success: false, error: 'Server Error'});
            }
        req.flash('error', 'There was a problem creating your training log entry.')
        res.status(500).render('training-logs/log-form', {
            pageTitle: 'Create New Training Log',
            currentPage: 'logs',
            formAction: '/logs',
            submitButtonText: 'Create Entry',
            errorMessage: 'Failed to create log',
            formData: req.body
        });
    }
};

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
        res.render('training-logs/show-log', {
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
        const alltrainingLogs = await TrainingLog.findAll({
            where: {
                userUuid: user.uuid,
                order: [['logDate', 'DESC']]
            }
        });

        res.render('training-logs/all-training-logs', {
            pageTitle: 'View training-logs',
            currentPage: 'logs',
            errorMessage: null,
            alltrainingLogs
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

        res.render('training-logs/log-form', {
            pageTitle: 'Edit Training Log',
            currentPage: 'logs',
            formAction: `/logs/edit/${trainingLogId}`,
            submitButtonText: 'Save Changes',
            errorMessage: null,
            formData: trainingLog
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
        return res.status(422).render('training-logs/log-form', {
            pageTitle: 'Edit Training Log',
            currentPage: 'logs',
            formAction: `/logs/edit/${trainingLogId}`,
            submitButtonText: 'Save Changes',
            formData: req.body,
            errorMessage: errors.array().map(e => e.msg).join(', ')
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

