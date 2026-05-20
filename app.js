var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var studentRouter = require('./routes/student');
var driverRouter = require('./routes/driver');
var adminRouter = require('./routes/admin');

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

// Serve React frontend build in production
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// API routes
app.use('/api/student', studentRouter);
app.use('/api/driver', driverRouter);
app.use('/api/admin', adminRouter);

// Serve React app for all other routes (SPA support)
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

module.exports = app;
