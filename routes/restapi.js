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
// {REST} Lista użytkowników
router.post('/rest/users/list', REST.getUserlist);
// {REST} Pobieranie użytkownika
router.post('/rest/user/show', REST.getUserById);
// {REST} Zmiana podstawowych danych użytkownika
router.post('/rest/users/modify', REST.modifyUserById);
// {REST} Zmiana hasła użytkownika
router.post('/rest/users/changepwd', REST.changeUserPassword);
// {REST} Usuwanie użytkownika
router.post('/rest/user/delete', REST.deleteUserById);
// {REST} Usuwanie wybranych użytkowników
router.post('/rest/user/sdelete', REST.deleteSelectedUsers);

module.exports = router;
