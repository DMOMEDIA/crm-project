const express = require('express');
const router = express.Router();

// Kontrolery
const PagesController = require('../controllers/PagesController');
const DashboardController = require('../controllers/DashboardController');

// Dashboard
router.get('/dashboard', PagesController.dashboard);
// Pracownicy
router.get('/dashboard/useradd', PagesController.useradd);
router.get('/dashboard/userlist', PagesController.userlist);
// Klienci
router.get('/dashboard/clientlist', PagesController.clientlist);
router.get('/dashboard/clientadd', PagesController.clientadd);
router.get('/dashboard/offers', PagesController.offers);
// Uprawnienia
router.get('/dashboard/permissions', PagesController.permissionPage);
// Profil
router.get('/dashboard/profile', PagesController.userProfile);
// Dokumentacja
router.get('/dashboard/documentation', PagesController.docs);
// Zgłaszanie błędów
router.get('/dashboard/report', PagesController.report);

module.exports = router;
