require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const csrf = require('csurf');
const errorController = require('./controllers/errorController')
const setCurrentUser = require('./middleware/auth/setCurrentUserMiddlware');
const authRouter = require('./routes/authRoutes');
const portalRouter = require('./routes/portalRoutes');
const publicRouter = require('./routes/publicRoutes');
const techniqueRouter = require('./routes/techniqueRoutes');
const trainingRouter = require('./routes/trainingRoutes');
const userRouter = require('./routes/userRoutes');
const { ppid } = require('process');

const PORT = process.env.PORT || 3000;
const app = express();

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Add a helper function to make path aliases work
app.locals.basedir = path.join(__dirname, 'views');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

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

// Add csrf token protection for global usage
app.use(csrf());

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(flash());

app.use(setCurrentUser);

app.use('/auth', authRouter);
app.use('/portal', portalRouter);
app.use('/profiles', userRouter);
app.use('/training/belt', techniqueRouter);
app.use('/training', trainingRouter);
app.use(publicRouter);

app.use((err, req, res, next) => {
    errorController.get500(err, req, res, next);
});
app.use(errorController.get404);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
