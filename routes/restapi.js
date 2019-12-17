const express = require('express');
const router = express.Router();
const upload = require('multer')();

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
router.get('/rest/users/namebyrole', REST.getUserlistByRole);
router.post('/rest/user/delete', REST.deleteUserById);
router.post('/rest/user/sdelete', REST.deleteSelectedUsers);

// {REST} dot. klientów
router.post('/rest/clients/add', REST.addClient);
router.post('/rest/clients/list', REST.getClientList);
router.post('/rest/clients/modify', REST.modifyClientById);
router.post('/rest/client/show', REST.getClientById);
router.post('/rest/client/status', REST.changeClientStatus);
router.post('/rest/roffer/list', REST.getOfferRequests);
router.post('/rest/roffer/get', REST.getRequestOfferById);
router.post('/rest/roffer/add', REST.addRequestOffer);
router.post('/rest/roffer/update', REST.updateROfferData);
router.post('/rest/roffer/sendMail', REST.requestOfferSendMail);
router.post('/rest/roffer/done', REST.requestOfferDone);

// {REST} powiadomienia
router.post('/rest/notifications', REST.getUserNotifications);
router.post('/rest/notification/unread', REST.notificationSetUnread);

// {REST} Oferty
router.post('/rest/offerlist', REST.loadOfferlist);
router.post('/rest/offer/get', REST.getOfferById);
router.post('/rest/offer/insert', REST.insertOffer);
router.post('/rest/offer/sdelete', REST.deleteSelectedOffers);
router.post('/rest/offer/status', REST.changeOfferStatus);
router.post('/rest/offer/data', REST.changeOfferData);
router.post('/rest/offer/sendmail', REST.sendOfferMail);
router.post('/rest/offer/sendmail_onList', REST.sendOfferMail_onList);
router.post('/rest/offer/realize', REST.realizeOffer);
router.post('/rest/offer/cancel', REST.cancelOffer);
router.get('/rest/client/remotelist', REST.clientRemoteList);
router.get('/rest/company/remotelist', REST.companyRemoteList);

// {REST} Upload files
router.post('/rest/files/upload', upload.array('source_file[]'), REST.uploadOfferFiles);
router.post('/rest/files/upload/client', upload.array('source_file[]'), REST.uploadClientFiles);
router.post('/rest/files/upload/roffer', upload.array('source_file[]'), REST.uploadRequestOfferFiles);
router.post('/rest/files/get', REST.getFiles);
router.post('/rest/file/download', REST.downloadFile);
router.post('/rest/file/delete', REST.deleteFile);
router.post('/rest/file/rename', REST.changeFileVerify);

// {REST} Firmy
router.post('/rest/company/list', REST.loadCompanylist);
router.post('/rest/company/add', REST.addCompany);
router.post('/rest/company/get', REST.getCompanyById);
router.post('/rest/company/edit', REST.editCompany);
router.post('/rest/company/provision', REST.getCompanyProvision);

// statistics
router.post('/rest/stats/offers_count', REST.getOfferCount);
router.post('/rest/stats/prov_forecast', REST.getProvisionStats);
router.post('/rest/stats/counts', REST.getStatsCount);

module.exports = router;
