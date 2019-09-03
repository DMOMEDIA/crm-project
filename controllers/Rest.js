const Roles = require('../models/roles');
const User = require('../models/user');

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
