const express = require('express');
const router = express.Router();

// Kontrolery
const REST = require('../controllers/Rest');

// {REST} Pobieranie uprawnień
router.get('/rest/permissions', REST.permissions);
// {REST} Zapis uprawnień
router.post('/rest/permissions/modify', REST.permissionsModify);
// {REST} Zapis nowego użytkownika
router.post('/rest/users/add', REST.addUser);
module.exports = router;
