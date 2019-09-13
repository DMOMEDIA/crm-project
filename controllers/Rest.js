const Roles = require('../models/roles');
const User = require('../models/user');
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
      var output = {}, count = 0, callback = [];
      var roles = ['administrator','posrednik','kierownik','pracownik'];
      async.each(roles, async function(value, cb) {
        await User.userList(value, cb => {
          for(var i of cb.toJSON().values()) {
            callback.push(i);
            count++;
          }
        });
      }, function() {
        output['meta'] = { page: 1, pages: 1, perpage: -1, total: count, sort: 'asc', field: 'id' };
        output['data'] = callback;
        res.send(output);
      });
      /* await User.userList(function(result, nums) {
        output['meta'] = { page: 1, pages: 1, perpage: -1, total: nums, sort: 'asc', field: 'id' };
        output['data'] = result;
        res.json(output);
      }); */
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.getUserById(req.body.id).then(function(user) {
          if(user != null) res.json(user);
          else res.json(Messages.message('not_found_user_identity', null));
        });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
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
