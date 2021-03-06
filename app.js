require('dotenv').config({ path: '.env' });

const express = require('express');
const path = require('path');
const multer = require('multer');
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
const LoginController = require('./controllers/LoginController');
const ClientController = require('./controllers/ClientController');
const PDFController = require('./controllers/PDFController');
const Cron = require('./controllers/Cron');
const System = require('./models/system');

const app = express();

// CronTab events
Cron.ScheduleEveryDay();
Cron.loopHandler();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({ limit: '50mb'} ));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
app.use(cookieParser());

app.use(flash());

app.use(session({
  secret: 'jMgwjH2bsLnGYxwF',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.locals.env = process.env;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.ACCESS_URL);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Content-Disposition, Access-Control-Expose-Headers, Authorization, Accept");
  next();
});

app.use(async function(req, res, next) {
  await LoginController.getPermissions(req, res, next);
  next();
});

app.use(function(req, res, next) {
 res.locals.user = req.user || null;
 res.locals.userData = req.session.userData || null;
 res.locals.userPermissions = req.session.userPermissions || null;

 // Wersja aplikacji
 res.locals.version_app = '1.8.1.5 beta';

 ExpireSession.sessionStatus(req, res, next);
 next();
});

app.use('/', routes, dash, restapi);

module.exports = app;
