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
const Cron = require('./controllers/Cron');
const System = require('./models/system');

const app = express();

// CronTab events
Cron.ScheduleEveryDay();
//

/* Mails.sendMail.send({
  template: 'client_offer',
  message: {
    from: '"CRM System" <kontakt@crmsystem.pl>',
    to: 'damian@dmomedia.pl',
    subject: 'Zapytanie ofertowe zostało złożone'
  },
  locals: {
    identity: '001/2019',
  }
}); */

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

app.locals.env = process.env;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.ACCESS_URL);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

 ExpireSession.sessionStatus(req, res, next);
 next();
});

app.use('/', routes, dash, restapi);

module.exports = app;
