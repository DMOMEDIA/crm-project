const Roles = require('../models/roles');
const User = require('../models/user');
const Client = require('../models/clients');
const ROffer = require('../models/roffers');
const Messages = require('../config/messages.js');
const async = require('async');

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
        email: req.body.email,
        telephone: req.body.pNumber,
        role: req.body.urole
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
    } else res.json(Messages.message('no_authorization', null));
    }
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
    if(res.locals.userPermissions.includes('crm.offers.show')) {
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

exports.getOfferById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.show')) {
      if(req.body.id != null) {
        ROffer.getOfferById(req.body.id, function(data) {
          if(data != null) res.json(data);
          else res.json(Messages.message('not_found_roffer', null));
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};
