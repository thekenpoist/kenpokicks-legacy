require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const attachFlashMessages = require('./middleware/attachFlashMessagesMiddleware');
const errorController = require('./controllers/errorController')
const setCurrentUser = require('./middleware/auth/setCurrentUserMiddlware');
const timezoneConversion = require('./middleware/timezoneConversionMiddleware');
const adminRouter = require('./routes/adminRoutes');
const authRouter = require('./routes/authRoutes');
const portalRouter = require('./routes/portalRoutes');
const publicRouter = require('./routes/publicRoutes');
const techniqueRouter = require('./routes/techniqueRoutes');
const trainingRouter = require('./routes/trainingRoutes');
const trainingLogRouter = require('./routes/trainingLogRoutes');
const userRouter = require('./routes/userRoutes');
const { createCsrfToken } = require('./middleware/csrfMiddleware');
const { ppid } = require('process');
const PORT = process.env.PORT || 3000;
const helmet = require('helmet');
const morgan = require('morgan');
const { logger, accessLogger } = require ('./utils/loggerUtil');
const app = express();

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Add a helper function to make path aliases work
app.locals.basedir = path.join(__dirname, 'views');

// Use helmet to apply safe default security headers
const isProd = process.env.NODE_ENV === 'production';

app.use(helmet({
  // Keep Helmet’s default CSP, etc.
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // override default
  xFrameOptions: { action: 'deny' }, // legacy but fine for old browsers
  crossOriginResourcePolicy: { policy: 'same-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Only send HSTS in prod
  strictTransportSecurity: isProd ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: false,
  } : false,
}));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Access logging
const stream = { write: (msg) => accessLogger.info(msg.trim()) };
app.use(morgan('combined', { stream }));

// Middleware: JSON/form parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

app.use(createCsrfToken);
app.use(flash());
app.use(attachFlashMessages);
app.use(setCurrentUser);
app.use(timezoneConversion);

app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/portal', portalRouter);
app.use(publicRouter);
app.use('/techniques', techniqueRouter);
app.use('/training', trainingRouter);
app.use('/logs', trainingLogRouter);
app.use('/profiles', userRouter);

// Generic 500 error handler
app.use((err, req, res, next) => {
    errorController.get500(err, req, res, next);
});

// 404 error fallback
app.use(errorController.get404);

// Central error handler
app.use((err, req, next) => {
  logger.error(err);
  const status = err.status || 500;
  res.status(status).json({
    err: status >= 500 ? 'Internal Server Error' : err.message
  });
});

// Safety nets
process.on('unhandledRejection', (reason) => logger.error(reason));
process.on('uncaughtException', (err) => { logger.error(err); process.exit(1); })

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
