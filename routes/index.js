const express = require('express');
const router = express.Router();

// Kontrolery
const PagesController = require('../controllers/PagesController');
const LoginController = require('../controllers/LoginController');
const ClientController = require('../controllers/ClientController');

// Kontrolery stron
router.get('/', PagesController.login);
router.get('/logout', PagesController.logout);


router.post('/',
  LoginController.passportAuthenticate,
  LoginController.successLogin
);

LoginController.validate,
LoginController.checkValidation,
LoginController.passportSerializeUser,
LoginController.passportDeserializeUser,
LoginController.passportUse

router.post('/api/login',
  ClientController.clientAuthenticate,
  ClientController.clientLogin
);

ClientController.clientAuthUse();

module.exports = router;
