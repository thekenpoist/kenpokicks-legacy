require('dotenv').config();

const path = require('path');
const express = require('express');
const errorController = require('./controllers/errorController')
const PORT = process.env.PORT || 3000;

const app = express();

const indexRouter = require('./routes/indexRoutes');

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Add a helper function to make path aliases work
app.locals.basedir = path.join(__dirname, 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRouter);

app.use(errorController.get500);
app.use(errorController.get404);

app.listen(PORT);
