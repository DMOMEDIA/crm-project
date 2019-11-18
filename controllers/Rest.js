const Roles = require('../models/roles');
const User = require('../models/user');
const Client = require('../models/clients');
const ROffer = require('../models/roffers');
const Offer = require('../models/offers');
const Company = require('../models/companies');
const Notification = require('../models/notifications');
const Messages = require('../config/messages.js');
const System = require('../models/system');
const async = require('async');

// String truncate
String.prototype.trunc = String.prototype.trunc ||
function(n){
    return (this.length > n) ? this.substr(0, n-1) + '&hellip;' : this;
};
//

exports.permissions = async (req, res) => {
  if(req.isAuthenticated()) {
    await Roles.getPermissionByRole(req.query.role, function(data) {
      res.send(data);
    }).catch(function(err) {
      res.json(Messages.message('data_get_error', null));
    });
  } else res.json(Messages.message('no_authorization', null));
};

exports.permissionsModify = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.role != null) {
      Roles.savePermissions(req.body.role, (req.body.permissions ? req.body.permissions : null), function(callback) {
        res.send(callback);
      });
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.addUser = (req, res) => {
  if(req.isAuthenticated()) {
    var permission = 'crm.employees.add.' + req.body.urole;
    if(!res.locals.userPermissions.includes(permission)) {
      return res.json(Messages.message('save_user_critical_err', null));
    }
    if(req.body.password != req.body.confirm_password) {
      return res.json(Messages.message('save_user_critical_err', null));
    }

    // Zapis do bazy danych
    if(req.body != null) {
      User.createUser({
        identity: req.body.gen_identity,
        password: req.body.password,
        fullname: req.body.firstname + ' ' + req.body.lastname,
        address: req.body.address,
        postcode: req.body.postcode,
        city: req.body.city,
        voivodeship: req.body.voivodeship,
        country: req.body.country,
        email: req.body.email,
        telephone: req.body.pNumber,
        role: req.body.urole,
        isCompany: req.body.isCompany
      });

      res.json(Messages.message('added_new_user', req.body.gen_identity));
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserlist = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.show')) {
      var output = {};
      if(req.session.userData.role == 'administrator') {
        User.userList(null, function(result, nums) {
          output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
          output['data'] = result;
          res.json(output);
        });
      } else {
        User.userListByAssignedId(null, req.session.userData.id, function(result, nums) {
          output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
          output['data'] = result;
          res.json(output);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserlistName = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.client.assign_edit')) {
      if(req.session.userData.role == 'administrator') {
        User.userList(['id','fullname','role'], function(result,  nums) {
          res.json(result);
        });
      } else {
        User.userListByAssignedId(['id','fullname','role'], req.session.userData.id, function(result, nums) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserlistByRole = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.users.assign_edit')) {
      if(req.query.role != null) {
        User.userlistByRole(['id','fullname','role'], req.query.role, function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.getUserById(null, req.body.id).then(function(user) {
          if(user != null) res.json(user);
          else res.json(Messages.message('not_found_user_identity', null));
        });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserByIdLimited = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.id != null) {
      User.getUserById(['id','fullname','role'], req.body.id).then(function(user) {
        if(user != null) res.json(user);
        else res.json(Messages.message('not_found_user_identity', null));
      });
    } else res.json(Messages.message('identity_not_selected', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.modifyUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.userModify(req.body, result => { res.send(result) });
      }
      else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.changeUserPassword = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.userChangePassword(req.body, result => { res.send(result) });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.deleteUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.delete')) {
      if(req.body.id != null) {
        User.deleteUser(req.body.id, result => { res.send(result) });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.deleteSelectedUsers = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.data != null) {
      var deleted = 0;
      async.each(req.body.data, async function(value, cb) {
        await User.deleteUser(value, cb => {
          if(cb.status == 'success') deleted++;
        });
      }, function() {
        if(deleted > 0) res.json(Messages.message('success_delete_selected_users', deleted));
        else res.json(Messages.message('err_selected_users', null));
      });
    }
  } else res.json(Messages.message('no_authorization', null));
}

// == Client page REST

exports.addClient = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.clients.add')) {

      // Zapis do bazy danych
      if(req.body != null) {

          if(req.body.client_type == 0) var clientname = req.body.firstname + ' ' + req.body.lastname;
          else var clientname = req.body.companyName;

          Client.createClient({
            fullname: clientname,
            nip: req.body.nip,
            phone: req.body.phone,
            email: req.body.email,
            company: req.body.client_type,
            company_type: req.body.company_type,
            state: 2,
            user_id: req.body.param
          }).then(function() {
            Notification.sendNotificationToUser(req.body.param, 'flaticon-users-1 kt-font-success', 'Klient <b>' + clientname.trunc(25) + '</b> został przypisany do Twojej obsługi.');
            System.createLog('create_client_log', 'Klient ' + clientname.trunc(25) + ' został utworzony (USER=' + req.session.userData.id + ').');
          });
        }

        res.json(Messages.message('added_new_client', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getClientList = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.clients.show')) {
      var output = {};
      if(req.session.userData.role == 'administrator') {
        Client.clientList(function(result, nums) {
          output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
          output['data'] = result;
          res.json(output);
        });
      } else {
        Client.clientlistByAssignedId(req.session.userData.id, function(result, nums) {
          output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
          output['data'] = result;
          res.json(output);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getClientById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.clients.edit')) {
      if(req.body.id != null) {
        Client.getClientById(req.body.id).then(function(user) {
          if(user != null) res.json(user);
          else res.json(Messages.message('not_found_client_identity', null));
        });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.modifyClientById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.clients.edit')) {
      if(req.body.id != null) {
        Client.saveClientData(req, result => { res.send(result) });
      }
      else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

// { Zapytania ofertowe }
exports.getOfferRequests = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.roffers.show')) {
      var output = {};

      if(req.session.userData.role == 'administrator') {
        ROffer.getClientOffers(function(data, nums) {
          output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
          output['data'] = data;
          res.json(output);
        });
      } else {
        ROffer.getClientOffersAssigned(req.session.userData.id, function(data, nums) {
          if(data != null) {
            output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
            output['data'] = data;
            res.json(output);
          }
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getRequestOfferById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.roffers.show')) {
      if(req.body.id != null) {
        ROffer.getOfferById(req.body.id, function(data) {
          if(data != null) res.json(data);
          else res.json(Messages.message('not_found_roffer', null));
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

// Notifications //

exports.getUserNotifications = (req, res) => {
  if(req.isAuthenticated()) {
    var output = {};
    Notification.getUserNotifications(req.session.userData.id, function(data, unread) {
      if(data != null) {
        output = { unread: unread };
        output['notifications'] = data;
        res.json(output);
      } else res.json(Messages.message('no_notification', null));
    });
  } else res.json(Messages.message('no_authorization', null));
};

exports.notificationSetUnread = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.id != null) {
      Notification.setUnreadNotification(req.body.id, function(result) {
        res.json(result);
      });
    } else res.json({ status: 'error' });
  } else res.json(Messages.message('no_authorization', null));
};

// ------------ //

// Oferty //

exports.loadOfferlist = (req, res) => {
  var output = {};
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.show')) {
      Offer.getOffers(req, function(result, nums) {
        output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
        output['data'] = result;
        res.json(result);
      });
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.clientRemoteList = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.session.userData.role == 'administrator') {
      Client.clientList(function(result, nums) {
        res.json(result);
      });
    } else {
      Client.clientlistByAssignedId(req.session.userData.id, function(result, nums) {
        res.json(result);
      });
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.companyRemoteList = (req, res) => {
  if(req.isAuthenticated()) {
    Offer.companyList(function(result) {
      res.json(result);
    });
  } else res.json(Messages.message('no_authorization', null));
};

exports.getOfferById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.show')) {
      if(req.body.id != null && req.body.type != null) {
        Offer.getOfferById(req.body.id, req.body.type, function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.insertOffer = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.add')) {
      if(req.body != null) {
        Offer.createOffer(req);
        res.json(Messages.message('added_new_offer'));
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

// Firmy

exports.loadCompanylist = (req, res) => {
  var output = {};
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.companies.show')) {
      Company.getCompanyList(function(result, nums) {
        output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
        output['data'] = result;
        res.json(result);
      });
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.addCompany = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.companies.add')) {
      if(req.body != null) {
        Company.addNewCompany(req.body, result => { res.json(result) });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};
