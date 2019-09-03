const User = require('../models/user');
const ExpireSession = require('../controllers/ExpireSession');
const Roles = require('../models/roles');
const passport = require('passport');
const localStrategy = require('passport-local');
const { check, validationResult } = require('express-validator');


// Walidacja formularza logowania
exports.validate = [
  check('identity').trim().isLength({ min: 1 }).withMessage('Identyfikator użytkownika jest wymagany.'),
  check('password').isLength({ min: 1 }).withMessage('Hasło jest wymagane.'),
];

// Sprawdzenie występowania błędów walidacji
exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.render('login', {
      validated: req.body,
      errors: errors.mapped()
    });
  }
  next();
};

exports.getPermissions = async (req, res, next) => {
  if(req.isAuthenticated()) {
    if(req.session.userData.role != null) {
      await Roles.getPermissionByRole(req.session.userData.role, function(result) {
        req.session.userPermissions = result;
      });
    }
  }
  res.redirect('/dashboard');
};

// Udane logowanie / zbieranie danych do sesji
exports.successLogin = (req, res, next) => {
  req.session.userData = req.user;

  req.session.expireSession = (new Date().getTime() + 900000);
  req.session.failLogin = null;

  next();
};

// {START} Funkcje autoryzacji, uwierzytelniania.
exports.passportAuthenticate = passport.authenticate('local', { failureRedirect: '/', failureFlash: 'Autoryzacja nieudana' });

exports.passportSerializeUser = passport.serializeUser(function(user, done) {
  done(null, user.id);
});

exports.passportDeserializeUser = passport.deserializeUser(function(id, done) {
  User.getUserById(id).then(function(user) {
    done(null, user);
  });
});

exports.passportUse = passport.use(new localStrategy({ usernameField: 'identity', passReqToCallback: true }, async function(req, username, password, done) {
  await User.getUserByIdentity(username).then(function(userData) {
    if(!userData) {
      return done(null, false, req.flash('message','Użytkownik o podanym identyfikatorze nie istnieje.'));
    }

    User.comparePassword(password, userData.get('password'), function(err, isMatch) {
      if(err) return done(err);
      User.isBlocked(userData.get('id'), function(isBlocked) {
        if(!isBlocked) {
          if(isMatch) {
            return done(null, userData.toJSON());
          } else {
            ExpireSession.failureLogin(req, userData.get('id'), done);
          }
        } else return done(null, false, req.flash('message','Konto jest zablokowane, spróbuj ponownie później.'));
      });
    });
  });
}));
// {KONIEC} Funkcje autoryzacji, uwierzytelniania.
