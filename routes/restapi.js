const express = require('express');
const router = express.Router();

// Kontrolery
const REST = require('../controllers/Rest');

// {REST} Pobieranie uprawnień
router.get('/rest/permissions', REST.permissions);
// {REST} Zapis uprawnień
router.post('/rest/permissions/modify', REST.permissionsModify);

// {REST} dot. użytkowników

router.post('/rest/users/add', REST.addUser);
router.post('/rest/users/list', REST.getUserlist);
router.post('/rest/user/show', REST.getUserById);
router.post('/rest/user/showlimited', REST.getUserByIdLimited);
router.post('/rest/users/modify', REST.modifyUserById);
router.post('/rest/users/changepwd', REST.changeUserPassword);
router.get('/rest/users/name', REST.getUserlistName);
router.post('/rest/user/delete', REST.deleteUserById);
router.post('/rest/user/sdelete', REST.deleteSelectedUsers);

// {REST} dot. klientów
router.post('/rest/clients/list', REST.getClientList);
router.post('/rest/clients/modify', REST.modifyClientById);
router.post('/rest/client/show', REST.getClientById);
router.post('/rest/offer/list', REST.getOfferRequests);
router.post('/rest/offer/get', REST.getOfferById);

module.exports = router;
