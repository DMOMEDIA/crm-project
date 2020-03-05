const express = require('express');
const router = express.Router();
const upload = require('multer')();

// Middlewares
const clientAuth = require('../middlewares/clientAuth');

// Kontrolery
const REST = require('../controllers/Rest');
const ClientController = require('../controllers/ClientController');

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
router.post('/rest/user/resetpwd', REST.resetUserPassword);
router.post('/rest/user/recovery_pwd', REST.recoveryUserPwd);

// {REST} dot. klientów
router.post('/rest/clients/add', REST.addClient);
router.post('/rest/client/delete', REST.deleteClientById);
router.post('/rest/client/sdelete', REST.deleteSelectedClients);
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
router.post('/rest/roffer/delete', REST.deleteRequestOfferById);
router.post('/rest/roffer/sdelete', REST.deleteSelectedROffers);
router.post('/rest/roffer/add_system', REST.addRequestOfferBySystem);
router.get('/rest/client/activate', REST.activateClientAccount);

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
router.post('/rest/files/upload/mfiles', upload.array('source_file[]'), REST.uploadROfferMoreFiles);
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
router.post('/rest/company/sdelete', REST.deleteSelectedCompanies);
router.post('/rest/company/delete', REST.deleteCompany);

// statistics
router.post('/rest/stats/offers_count', REST.getOfferCount);
router.post('/rest/stats/prov_forecast', REST.getProvisionStats);
router.post('/rest/stats/counts', REST.getStatsCount);

// Client controllers
router.post('/api/client/data', clientAuth.authenticate, ClientController.getClientData);
router.post('/api/client/offers', clientAuth.authenticate, ClientController.getClientOffers);
router.post('/api/client/offer', clientAuth.authenticate, ClientController.getClientOfferById);
router.post('/api/client/filelist', clientAuth.authenticate, ClientController.getClientFilelist);
router.post('/api/client/file/download', clientAuth.authenticate, ClientController.downloadFileWithoutAuthentication);

module.exports = router;
