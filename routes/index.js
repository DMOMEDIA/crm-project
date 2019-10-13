const express = require('express');
const router = express.Router();

// Kontrolery
const PagesController = require('../controllers/PagesController');
const LoginController = require('../controllers/LoginController');

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

module.exports = router;
