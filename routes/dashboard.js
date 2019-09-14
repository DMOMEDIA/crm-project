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
// Uprawnienia
router.get('/dashboard/permissions', PagesController.permissionPage);

module.exports = router;
