const passport = require('passport');

exports.authenticate = (req, res, next) => {
  return passport.authenticate('jwt', { session: false })(req, res, next);
};
