const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages.js');
const async = require('async');

const User = bookshelf.Model.extend({
  tableName: 'crm_users',
  hasTimestamps: true,
  provision: function() {
    return this.hasMany(Provision, 'user_id', 'id');
  }
});

const Provision = bookshelf.Model.extend({
  tableName: 'crm_provisions',
  hasTimestamps: true
});

module.exports.getUserProvision = (id, callback) => {
  return new User().where({ id: id }).fetch({ withRelated: ['provision'] })
  .then(function(result) {
    var data = result.toJSON(),
    provision_f = parseFloat(0),
    provision = parseFloat(0);

    async.each(data.provision, function(element, cb) {
      if(element.forecast == true) {
        provision_f += parseFloat(element.value);
      } else {
        provision += parseFloat(element.value);
      }
      cb();
    }, function() {
      callback({ prov_forecast: provision_f, prov_normal: provision });
    });
  });
};

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
        address: user.address,
        postcode: user.postcode,
        city: user.city,
        voivodeship: user.voivodeship,
        country: user.country,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        company: parseInt(user.isCompany)
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

module.exports.userlistByRole = (args, role, callback) => {
  var roles = [], data = [];
  if(role == 'pracownik') roles = ['posrednik', 'kierownik', 'administrator'];
  else if(role == 'posrednik') roles = ['kierownik', 'administrator'];
  else if(role == 'kierownik') roles = ['administrator'];
  else roles = ['null'];
  var total_nums = roles.length, nums = 0;

  roles.forEach(function(item) {
    return new User().where({ role: item }).fetchAll({ columns: args }).then(function(response) {
      nums++;
      if(response) {
        data = data.concat(response.toJSON());
        if(total_nums == nums) {
          callback(data);
        }
      }
    });
  });
};

module.exports.userModify = (user, callback) => {
  return new User().where({ id: user.id }).fetch().then(function(model) {
    if(model) {
      if(user.firstname && user.lastname) model.set('fullname', user.firstname + ' ' + user.lastname);
      if(user.identity) model.set('identity', user.identity);
      if(user.role) model.set('role', user.role);
      if(user.email) model.set('email', user.email);
      if(user.address) model.set('address', user.address);
      if(user.postcode) model.set('postcode', user.postcode);
      if(user.voivodeship) model.set('voivodeship', user.voivodeship);
      if(user.country) model.set('country', user.country);
      if(user.city) model.set('city', user.city);
      if(user.pNumber) model.set('telephone', user.pNumber);
      if(user.param) model.set('assigned_to', user.param);
      if(user.isCompany) model.set('company', parseInt(user.isCompany));

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
