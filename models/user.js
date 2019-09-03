const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');

const User = bookshelf.Model.extend({
  tableName: 'crm_users',
  hasTimestamps: true
});

module.exports.getUserByIdentity = function(user) {
  const query = { identity: user };
  return new User().where(query).fetch();
};

module.exports.getUserById = function(id) {
  const query = { id: id };
  return new User().where(query).fetch();
};

module.exports.blockAccount = function(id, datetime) {
  const query = { id: id };
  return new User().where(query).fetch().then(function(model) {
    if(model) {
      model.set('fail_login', datetime);
      return model.save();
    }
  })
};

module.exports.isBlocked = function(id, callback) {
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

module.exports.comparePassword = function(candidatePassword, password, callback) {
  bcrypt.compare(candidatePassword, password, function(err, isMatch) {
    callback(null, isMatch);
  });
};

// Opcja do zmiany
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
