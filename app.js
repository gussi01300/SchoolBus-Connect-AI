var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var studentRouter = require('./routes/student');
var driverRouter = require('./routes/driver');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60,
    },
  }),
);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

//Frontend routes
app.use('/api/student', studentRouter);
app.use('/api/driver', driverRouter);

module.exports = app;
