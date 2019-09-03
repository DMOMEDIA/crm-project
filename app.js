require('dotenv').config({ path: '.env' });

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');

// Routes
const routes = require('./routes/index');
const dash = require('./routes/dashboard');
const restapi = require('./routes/restapi');
const errorsHandler = require('./middlewares/errors');
const ExpireSession = require('./controllers/ExpireSession');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(flash());

app.use(session({
  secret: 'jMgwjH2bsLnGYxwF',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
 res.locals.user = req.user || null;
 res.locals.userData = req.session.userData || null;
 res.locals.userPermissions = req.session.userPermissions || null;

 ExpireSession.sessionStatus(req, res, next);
 next();
});

app.use('/', routes, dash, restapi);

module.exports = app;
