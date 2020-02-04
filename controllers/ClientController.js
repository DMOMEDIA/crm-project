const Client = require('../models/clients');
const Offer = require('../models/offers');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const path = require('path');
const mime = require('mime');

Offer.getOffersByClientId(45, function() { });

const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

exports.clientAuthenticate = passport.authenticate('client', { session: false });

exports.clientLogin = (req, res, next) => {
  var token = jwt.sign({ id: req.user.id },  process.env.JWT_SECRET, { expiresIn: 3600 });
  if(req.user.message) {
    res.send({ status: 'error', message: req.user.message });
  } else {
    res.send({ token: token });
  }
};

function verifyCallback(payload, done) {
  Client.getClientById(payload.id)
  .then(user => {
    return done(null, user);
  })
  .catch(err => {
    return done(err);
  });
}

exports.clientAuthUse = () => {
  var config = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use('client', new localStrategy({ usernameField: 'email' }, async function(email, password, done) {
    await Client.getClientByEmail(email)
    .then(clientData => {
      if(!clientData) {
        return done(null, { message: 'Konto do którego próbujesz się zalogować nie istnieje.' });
      }

      Client.comparePassword(password, clientData.get('password'), function(err, isMatch) {
        if(err) return done(err);
        if(isMatch) {
          return done(null, clientData.toJSON());
        } else {
          return done(null, { message: 'Wprowadzone hasło jest niepoprawne, spróbuj ponownie.' });
        }
      });
    });
  }));

  passport.use(new JwtStrategy(config, verifyCallback));
}

exports.getClientData = (req, res) => {
  Client.getClientById(req.user.id).then(result => {
    res.json(result.toJSON());
  });
};

exports.getClientOffers = (req, res) => {
  Offer.getOffersByClientId(req.user.id, result => {
    res.json(result);
  });
};

exports.getClientOfferById = (req, res) => {
  Offer.getOfferWithFilesById(req.body.id, req.body.type, function(result) {
    res.json(result);
  });
};

exports.getClientFilelist = (req, res) => {
  Client.getClientFiles(req.body.id, function(result) {
    res.json(result);
  });
};

exports.downloadFileWithoutAuthentication = (req, res) => {
  if(req.body) {
    console.log('work');
    var file = './uploads/' + req.body.path,
    mimetype = mime.getType(file);

    res.setHeader('Content-Type', mimetype);

    res.download(file);
  }
}
