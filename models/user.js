const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');

const User = bookshelf.Model.extend({
  tableName: 'crm_users',
  hasTimestamps: true
});

module.exports.getUserByIdentity = (user) => {
  const query = { identity: user };
  return new User().where(query).fetch();
};

module.exports.getUserById = (id) => {
  const query = { id: id };
  return new User().where(query).fetch();
};

module.exports.blockAccount = (id, datetime) => {
  const query = { id: id };
  return new User().where(query).fetch().then(function(model) {
    if(model) {
      model.set('fail_login', datetime);
      return model.save();
    }
  })
};

module.exports.isBlocked = (id, callback) => {
  const query = { id: id };
  return new User().where(query).fetch().then(function(model) {
    if(model) {
      const getdate = new Date(model.get('fail_login')).getTime();
      const expired = getdate - (new Date().getTime());
      if(expired <= 0) {
        callback(false);
      } else callback(true);
    }
  })
};

module.exports.comparePassword = (candidatePassword, password, callback) => {
  bcrypt.compare(candidatePassword, password, function(err, isMatch) {
    callback(null, isMatch);
  });
};

module.exports.createUser = (user) => {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      return new User({
        identity: user.identity,
        password: hash,
        fullname: user.fullname,
        email: user.email,
        telephone: user.telephone,
        role: user.role
      }).save();
    });
  });
};

module.exports.userList = (role, callback) => {
  return new User().where({ role: role }).fetchAll().then(function(response) {
    callback(response);
  });
};

module.exports.userModify = (user, callback) => {
  return new User().where({ id: user.id }).fetch().then(function(model) {
    if(model) {
      if(user.firstname && user.lastname) model.set('fullname', user.firstname + ' ' + user.lastname);
      if(user.identity) model.set('identity', user.identity);
      if(user.role) model.set('role', user.role);
      if(user.email) model.set('email', user.email);
      if(user.pNumber) model.set('telephone', user.pNumber);

      model.save();

      status = { status: 'success', message: 'Poprawnie zaktualizowano dane użytkownika.' };
      callback(status);
    } else {
      status = { status: 'error', message: 'Użytkownik o podanym identyfikatorze nie istnieje.' };
      callback(status);
    }
  })
};

module.exports.userChangePassword = (user, callback) => {
  return new User().where({ id: user.id }).fetch().then(function(model) {
    if(model) {
      if(user.current_password && user.new_password && user.confirm_password) {
        bcrypt.compare(user.current_password, model.get('password'), function(error, isMatch) {
          if(error) {
            var status = { status: 'error', message: 'Nie udało się zmienić hasła, spróbuj ponownie później.' };
            callback(status);
          }

          if(isMatch) {
            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(user.new_password, salt, function(err, hash) {
                model.set('password', hash);
                model.save();
                var status = { status: 'success', message: 'Poprawnie zmieniono hasło użytkownika.' };
                callback(status);
              });
            });
          } else {
            var status = { status: 'error', message: 'Aktualne hasło jest niepoprawne.' };
            callback(status);
          }
        });
      }
    } else {
      status = { status: 'error', message: 'Użytkownik o podanym identyfikatorze nie istnieje.' };
      callback(status);
    }
  });
};

module.exports.deleteUser = (id, callback) => {
  return new User().where({ id: id }).fetch().then(function(model) {
    if(model) {
      status = { status: 'success', message: 'Użytkownik został pomyślnie usunięty.' };
      callback(status);
      return model.destroy();
    } else {
      status = { status: 'error', message: 'Użytkownik o podanym identyfikatorze nie istnieje.' };
      callback(status);
    }
  });
};
