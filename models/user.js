const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages.js');

const User = bookshelf.Model.extend({
  tableName: 'crm_users',
  hasTimestamps: true
});

module.exports.getUserByIdentity = (user) => {
  const query = { identity: user };
  return new User().where(query).fetch();
};

module.exports.getUserById = (args, id) => {
  if(args != null) {
    const query = { id: id };
    return new User().where(query).fetch({ columns: args });
  } else {
    const query = { id: id };
    return new User().where(query).fetch();
  }
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

module.exports.userList = (args, callback) => {
  if(args != null) {
    return new User().fetchAll({ columns: args }).then(function(response) {
      User.forge().count().then(function(cnt) {
        callback(response, cnt);
      });
    });
  } else {
    return new User().fetchAll().then(function(response) {
      User.forge().count().then(function(cnt) {
        callback(response, cnt);
      });
    });
  }
};

module.exports.userListByAssignedId = (args, id, callback) => {
  if(args != null) {
    return new User().where({ assigned_to: id }).fetchAll({ columns: args }).then(function(response) {
      User.where({ assigned_to: id }).count().then(function(cnt) {
        callback(response, cnt);
      });
    });
  } else {
    return new User().where({ assigned_to: id }).fetchAll().then(function(response) {
      User.where({ assigned_to: id }).count().then(function(cnt) {
        callback(response, cnt);
      });
    });
  }
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

      callback(Messages.message('success_updated_user', null));
    } else callback(Messages.message('not_found_user_identity', null));
  })
};

module.exports.userChangePassword = (user, callback) => {
  return new User().where({ id: user.id }).fetch().then(function(model) {
    if(model) {
      if(user.current_password && user.new_password && user.confirm_password) {
        bcrypt.compare(user.current_password, model.get('password'), function(error, isMatch) {
          if(error)
            callback(Messages.message('password_not_changed', null));

          if(isMatch) {
            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(user.new_password, salt, function(err, hash) {
                model.set('password', hash);
                model.save();
                callback(Messages.message('success_change_password', null));
              });
            });
          } else callback(Messages.message('current_pass_incorrect', null));
        });
      }
    } else callback(Messages.message('not_found_user_identity', null));
  });
};

module.exports.deleteUser = (id, callback) => {
  return new User().where({ id: id }).fetch().then(function(model) {
    if(model) {
      callback(Messages.message('success_user_deleted', null));
      return model.destroy();
    } else callback(Messages.message('not_found_user_identity', null));
  });
};
