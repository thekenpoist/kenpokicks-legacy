require('dotenv').config();

const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();

const indexRouter = require('./routes/index');

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Add a helper function to make path aliases work
app.locals.basedir = path.join(__dirname, 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRouter);

app.use((req, res, next) => {
    res.status(404).render('404', {title: 'Page Not Found'});
});

app.listen(PORT);
