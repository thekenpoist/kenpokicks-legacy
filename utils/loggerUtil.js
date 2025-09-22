const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

const ENV = process.env.NODE_ENV || 'development';
const LOG_DIR = process.env.LOG_DIR || path.resolve(process.cwd(), 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

const baseFormat = format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
);

const logger = createLogger({
    level: process.env.LOG_LEVEL || (ENV === 'production' ? 'info' : 'debug'),
    defaultMeta: { service: process.env.SERVICE_NAME || 'kenpokicks', env: ENV, pid: process.pid },
    transports: [
        new transports.File({
            filename: path.join(LOG_DIR, 'app.log'),
            format: baseFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 3,
            tailable: true
        }),
        new transports.File({
            filename: path.join(LOG_DIR, 'error.log'),
            level: 'error',
            format: baseFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
            tailable: true
        }),
    ],
    exceptionHandlers: [
        new transports.File({
            filename: path.join(LOG_DIR, 'exceptions.log'),
            format: baseFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 3,
            tailable: true
        }),
    ],
    rejectionHandlers: [
        new transports.File({
            filename: path.join(LOG_DIR, 'rejections.log'),
            format: baseFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 3,
            tailable: true
        }),
    ]
});

const accessLogger = createLogger({
    level: 'info',
    defaultMeta: { service: process.env.SERVICE_NAME || 'kenpokicks', env: ENV, pid: process.pid, stream: 'access' },
    transports: [
        new transports.File({
            filename: path.join(LOG_DIR, 'access.log'),
            format: baseFormat,
            maxsize: 50 * 1024 * 1024,
            maxFiles: 3,
            tailable: true
        })
    ]
});


module.exports = { logger, accessLogger };