require('dotenv').config();

const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();

const indexRouter = require('./routes/index');

app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRouter);

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(PORT);
