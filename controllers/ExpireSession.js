const User = require('../models/user');
const format = require('date-format');

exports.sessionStatus = function(req, res, next) {
  if(req.session.expireSession != null) {
    const expired = (req.session.expireSession - (new Date().getTime()));
    if(expired < 0) {
      req.logout();
      req.session.expireSession = null;

      req.flash('message', 'Sesja wygasła, zaloguj się ponownie.');
    } else req.session.expireSession = (new Date().getTime() + 900000);
  }
}

exports.failureLogin = function(req, userID, done) {
  if(req.session.failLogin == null) {
    req.session.failLogin = 1;
    return done(null, false, req.flash('message', 'Hasło jest niepoprawne, spróbuj ponownie (' + req.session.failLogin + '/3).'));
  } else {
    if(req.session.failLogin < 3) {
      req.session.failLogin = req.session.failLogin + 1;
      return done(null, false, req.flash('message', 'Hasło jest niepoprawne, spróbuj ponownie (' + req.session.failLogin + '/3).'));
    } else {
      req.session.failLogin = req.session.failLogin + 1;
      const date_expire = new Date(new Date().getTime()+1800000);
      User.blockAccount(userID, format('yyyy-MM-dd hh:mm:ss', date_expire)).then(function(callback) {
        req.session.failLogin = null;
        return done(null, false, req.flash('message', 'Twoje konto zostało zablokowane na 30 minut.'));
      });
    }
  }
}
