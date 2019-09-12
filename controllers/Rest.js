const Roles = require('../models/roles');
const User = require('../models/user');
const async = require('async');

exports.permissions = async (req, res) => {
  if(req.isAuthenticated()) {
    await Roles.getPermissionByRole(req.query.role, function(data) {
      res.send(data);
    }).catch(function(err) {
      var status = { status: 'error', message: 'Wystąpił problem podczas wczytywania danych, spróbuj ponownie później.' };
      res.send(status);
    });
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
};

exports.permissionsModify = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.role != null) {
      Roles.savePermissions(req.body.role, (req.body.permissions ? req.body.permissions : null), function(callback) {
        res.send(callback);
      });
    }
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
};

exports.addUser = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.password != req.body.confirm_password) {
      var status = { status: 'error', message: 'Wystąpił błąd krytyczny przy zapisie danych (1).' };
      return res.send(status);
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

      var status = { status: 'success', message: 'Dodano nowego użytkownika o identyfikatorze ' + req.body.gen_identity };
      res.send(status);
    }
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
};

exports.getUserlist = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.show')) {
      var output = {}, count = 0, callback = [];
      var roles = ['administrator', 'kierownik'];
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
    } else {
      var status = { status: 'error', message: 'Nie posiadasz uprawnień do wykonania tej czynności.' };
      res.send(status);
    }
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
};

exports.getUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.getUserById(req.body.id).then(function(user) {
          if(user != null) res.json(user);
          else {
            var status = { status: 'error', message: 'Użytkownik o podanym identyfikatorze nie istnieje.' };
            res.send(status);
          }
        });
      } else {
        var status = { status: 'error', message: 'Identyfikator nie został uwzględniony.' };
        res.send(status);
      }
    } else {
      var status = { status: 'error', message: 'Nie posiadasz uprawnień do wykonania tej czynności.' };
      res.send(status);
    }
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
};

exports.modifyUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.userModify(req.body, result => { res.send(result) });
      } else {
        var status = { status: 'error', message: 'Identyfikator nie został uwzględniony.' };
        res.send(status);
      }
    } else {
      var status = { status: 'error', message: 'Nie posiadasz uprawnień do wykonania tej czynności.' };
      res.send(status);
    }
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
};

exports.changeUserPassword = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.userChangePassword(req.body, result => { res.send(result) });
      } else {
        var status = { status: 'error', message: 'Identyfikator nie został uwzględniony.' };
        res.send(status);
      }
    } else {
      var status = { status: 'error', message: 'Nie posiadasz uprawnień do wykonania tej czynności.' };
      res.send(status);
    }
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
};

exports.deleteUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.delete')) {
      if(req.body.id != null) {
        User.deleteUser(req.body.id, result => { res.send(result) });
      } else {
        var status = { status: 'error', message: 'Identyfikator nie został uwzględniony.' };
        res.send(status);
      }
    } else {
      var status = { status: 'error', message: 'Nie posiadasz uprawnień do wykonania tej czynności.' };
      res.send(status);
    }
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
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
        if(deleted > 0) {
          var status = { status: 'success', message: 'Pomyślnie usunięto ' + deleted + ' użytkowników.' };
          res.send(status);
        } else {
          var status = { status: 'error', message: 'Błąd podczas usuwania użytkowników, spróbuj ponownie.' };
          res.send(status);
        }
      });
    }
  } else {
    var status = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' };
    res.send(status);
  }
}
