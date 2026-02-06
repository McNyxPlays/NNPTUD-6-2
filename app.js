const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const categoriesRouter = require('./routes/categories');

const app = express();

// view engine setup (nếu sau này cần render pug thì dùng, hiện tại làm API thì comment cũng được)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/categories', categoriesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.message,
    // chỉ show stack trong dev
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;