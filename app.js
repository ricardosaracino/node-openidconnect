/* FOR DEVELOPMENT ONLY: allow for self-signed/invalid certificates universally */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// https://stackoverflow.com/questions/21129989/internaloautherror-failed-to-obtain-access-token
require('https').globalAgent.options.rejectUnauthorized = false;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/* Example: configuring local session */
app.use(session(
    {
        store: new FileStore({}),
        secret: 'hnDf1Lam3cdwq9rXPmmJAJRqxQ20s4MR1c8VOPGImvxTfSnNQ79',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 3600000
        }
    }
));

/* Example: initializing Passport and configuring it for persistent login sessions */
app.use(passport.initialize());
app.use(passport.session());

/* Example: storing user data received from the strategy callback in the session, i.e. in `req.session.passport.user` */
passport.serializeUser(function (user, next) {
    next(null, user);
});

/* Example: getting the user data back from session and attaching it to the request object, i.e. to `req.user` */
passport.deserializeUser(function (user, next) {
    /*
      Example: if only a user identifier is stored in the session, this is where
      the full set could be retrieved, e.g. from a database, and passed to the next step
    */

    next(null, user);
});



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
