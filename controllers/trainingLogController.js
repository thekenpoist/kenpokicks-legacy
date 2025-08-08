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
            user: res.locals.currentUser || '',
            logIsPrivate: true
        }
    });
};

exports.postCreateTrainingLog = async (req, res, next) => {
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
        return isAjax
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

    try {
        const newLog = await TrainingLog.create({
            userUuid: user.uuid,
            logCategory,
            logTitle,
            logDescription,
            logDuration,
            logRelatedBelt,
            logDate,
            logIsPrivate: req.body.logIsPrivate,
            logIntensity
        });

        if (req.xhr) {
            return res.status(201).json({
                success: true,
                log: newLog
            });
        }
    } catch (err) {
        logger.error(`Error creating Log: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        if (isAjax) {
            return res.status(500).json({ success: false, error: 'Server Error'});
        }

        res.status(500).render('training-logs/log-form', {
            pageTitle: 'Create Entry',
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
            log: trainingLog
        });
    } catch (err) {
        logger.error(`Error fetching training log: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'dashboard');
    }
};

exports.getRecentTrainingLogs = async (req, res, next) => {
    try {
        const trainingLogs = await TrainingLog.findAll({
        where: { userUuid: res.locals.currentUser.uuid },
        order: [['logDate', 'DESC']],
        limit: 10
    });

    const html = trainingLogs.map(log => `
      <div class="grid grid-cols-3 text-sm text-gray-800 border-b border-gray-100 py-2 cursor-pointer hover:bg-gray-50"
           onclick="window.location='/logs/${log.logId}'">
        <div>${new Date(log.logDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div>${log.logCategory}</div>
        <div>${log.logTitle || '(No Title)'}</div>
      </div>`).join('');

    res.send(html);
    } catch (err) {
        logger.error(`Error fetching training log: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        res.status(500).send('Failed to fetch recent logs');
    }
};

exports.getAllTrainingLogs = async (req, res, next) => {
    const user = res.locals.currentUser;

    if (!user) {
        return res.redirect('/auth/login');
    }

    try {
        const alltrainingLogs = await TrainingLog.findAll({
            where: { userUuid: user.uuid },
            order: [['logDate', 'DESC']]
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

        const trainingLogData = trainingLog.toJSON();
        if (trainingLogData.logDate) {
            trainingLogData.logDate = new Date(trainingLogData.logDate).toISOString().slice(0,10);
        }

        res.render('training-logs/log-form', {
            pageTitle: 'Edit Training Log',
            currentPage: 'logs',
            formAction: `/logs/edit/${trainingLogId}`,
            submitButtonText: 'Save Changes',
            errorMessage: null,
            layout: false,
            formData: trainingLogData
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
    const errors = validationResult(req);
    const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
    const { logId } = req.params;

    if(!errors.isEmpty()) {
        if (isAjax) {
            return res.status(422).json({
                success: false,
                errors: errors.array()
            });
        }

        const formData = { ...req.body };
        if (formData.logDate) {
            try { formData.logDate = new Date(formData.logDate).toISOString().slice(0, 10); } catch {}
        }

        return res.status(422).render('training-logs/log-form', {
            pageTitle: 'Edit Training Log',
            currentPage: 'logs',
            formAction: `/logs/edit/${logId}`,
            submitButtonText: 'Save Changes',
            formData,
            errorMessage: errors.array().map(e => e.msg).join(', '),
            layout: isAjax ? false : undefined
        });
    }

    const user = res.locals.currentUser;
    if (!user) {
        return isAjax
            ? res.status(401).json({ success: false, error: 'Unauthorized' })
            : res.redirect('/auth/login');
    }

    const normalizedIsPrivate = req.body.logIsPrivate === 'on' || req.body.logIsPrivate === true || req.body.logIsPrivate === 'true';

    const {
            logCategory,
            logTitle,
            logDescription,
            logDuration,
            logRelatedBelt,
            logDate,
            logIntensity
        } = req.body;

    try {
        const trainingLog = await TrainingLog.findOne({
            where: {
                userUuid: user.uuid,
                logId
            }
        });

        if (!trainingLog) {
            if (isAjax) return res.status(404).json({
                success: false, 
                error: 'Not found'
            });
            return res.status(404).render('404', {
                pageTitle: 'Training Log Not Found',
                currentPage: 'dashboard'
            });
        }

        await TrainingLog.update({
            logCategory,
            logTitle,
            logDescription,
            logDuration,
            logRelatedBelt,
            logDate,
            logIsPrivate: normalizedIsPrivate,
            logIntensity
        }, {
            where: { userUuid: user.uuid, logId }
        });

        if (isAjax) {
            return res.status(200).json({
                success: true,
                log: trainingLog.toJSON()
            });
        }
    } catch (err) {
        logger.error(`Error creating Log: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        if (isAjax) {
            return res.status(500).json({ success: false, error: 'Server Error'});
        }

        const formData = { ...req.body };
        if (formData.logDate) {
            try { formData.logDate = new Date(formData.logDate).toISOString().slice(0, 10); } catch {}
        }

         res.status(500).render('training-logs/log-form', {
            pageTitle: 'Edit Training Log',
            currentPage: 'logs',
            formAction: '/logs',
            submitButtonText: 'Save Changes',
            errorMessage: 'Failed to edit log',
            formData
        });
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
        res.redirect('/portal/dashboard');
    } catch (err) {
        logger.error(`Error Deleting Log: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'dashboard');

    }
};

