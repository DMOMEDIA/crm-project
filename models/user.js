const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages.js');
const async = require('async');
const generatePassword = require('password-generator');
const moment = require('moment');

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

module.exports.getUserProvision = async (id, dateFrom, callback) => {
  var date = moment(dateFrom).local();
  return new User().where({ id: id }).fetch({ withRelated: ['provision'] })
  .then(function(result) {
    var data = result.toJSON(),
    provision_f = parseFloat(0), provision = parseFloat(0), provision_c = parseFloat(0);

    async.each(data.provision, function(element, cb) {
      if(moment(element.created_at).local().diff(date) >= 0) {
        if(element.canceled == true) {
          provision_c += parseFloat(element.value);
        } else {
          if(element.forecast == true) provision_f += parseFloat(element.value);
          else provision += parseFloat(element.value);
        }
      }
      cb();
    }, function() {
      callback({ prov_forecast: provision_f, prov_normal: provision, prov_canceled: provision_c });
    });
  });
};

module.exports.getUserByIdentity = (user) => {
  const query = { identity: user };
  return new User().where(query).fetch();
};

module.exports.getUserPartner = (id, callback) => {
  return new User().where({ id: id }).fetch()
  .then(function(result) {
    if(result) {
      result = result.toJSON();
      var userRole = result.role;

      if(result.isPartner == true)
        return callback({ partner: result.id, agent: null, message: 'user_is_partner', role: null });

      if(result.assigned_to) {
        new User().where({ id: result.assigned_to }).fetch()
        .then(function(result) {
          result = result.toJSON();

          if(result.role == 'kierownik') {
            if(result.isPartner == true) {
              callback({ partner: result.id, agent: null, message: 'user_has_partner', role: userRole });
            } else callback({ partner: null, agent: null, message: 'user_no_partner' });
          } else if(result.role == 'posrednik') {
            var jsonCallback = { partner: null, agent: result.id, message: null, role: userRole };

            if(result.assigned_to) {
              new User().where({ id: result.assigned_to }).fetch()
              .then(function(result) {
                result = result.toJSON();

                if(result.isPartner == true && result.role == 'kierownik') {
                  jsonCallback.partner = result.id;
                  jsonCallback.message = 'partner_and_agent_found';
                  callback(jsonValue);
                } else callback({ partner: null, agent: null, message: 'user_no_partner' });
              });
            } else callback({ partner: null, agent: null, message: 'user_no_partner' });
          } else callback({ partner: null, agent: null, message: 'user_no_partner' });
        });
      } else callback({ partner: null, agent: null, message: 'user_is_not_assigned' });
    } else callback(Messages.message('not_found_user_identity', null));
  });
};

module.exports.getUserById = (args, id) => {
  if(args) {
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
        pesel: user.pesel,
        address: user.address,
        postcode: user.postcode,
        city: user.city,
        voivodeship: user.voivodeship,
        country: user.country,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        company: parseInt(user.isCompany),
        cname: user.cname,
        cnip: user.cnip,
        cregon: user.cregon,
        isPartner: parseInt(user.isPartner),
        assigned_to: user.assigned_to
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

/* module.exports.getUserListProvision = (callback) => {
  var output = [];
  return new User().fetchAll()
  .then(function(response) {
    response = response.toJSON();
    var number = 0;
    async.each(response, async function(e, cb) {
      await module.exports.getUserProvision(e.id, result => {
        e['provisions'] = result;

        output.push(e);
        number++;
      });
      if(response.length == number) cb();
    }, function() {
      callback(output, output.length);
    });
  });
}; */

module.exports.getUserListProvision = async (req, date, callback) => {
  var output = [];
  if(req.session.userData.role == 'administrator') {
    return new User().fetchAll()
    .then(function(response) {
      response = response.toJSON(), number = 0;

      async.each(response, async function(e, cb) {
        await module.exports.getUserProvision(e.id, date, result => {
          e['provisions'] = result;
        });

        output.push(e);
        number++;
        if(response.length == number) cb();
      }, function() {
        callback(output, output.length);
      });
    });
  } else {
    return new User().where({ assigned_to: req.session.userData.id }).fetchAll()
    .then(function(response) {
      response = response.toJSON(), number = 0;

      async.each(response, async function(e, cb) {
        await module.exports.getUserProvision(e.id, date, result => {
          e['provisions'] = result;
        });

        output.push(e);
        number++;
        if(response.length == number) cb();
      }, async function() {
        await new User().where({ id: req.session.userData.id }).fetch()
        .then(async function(res) {
          res = res.toJSON();
          await module.exports.getUserProvision(res.id, date, result => {
            res['provisions'] = result;
          });

          output.push(res);
        });
        callback(output, output.length);
      });
    });
  }
};

module.exports.userListByAssignedId = (args, id, callback) => {
  if(args != null) {
    var output = [];
    return new User().where({ assigned_to: id }).fetchAll({ columns: args }).then(function(response) {
      response = response.toJSON();
      output = output.concat(response);

      async.each(response, async function(element, cb) {
        await User.where({ assigned_to: element.id }).fetchAll({ columns: args }).then(function(resp) {
          if(resp) {
           output = output.concat(resp.toJSON());
          }
        });
        cb();
      }, function() {
        callback(output, output.length);
      });
    });
  } else {
    return new User().where({ assigned_to: id }).fetchAll().then(function(response) {
      callback(response, response.toJSON().length);
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
      if(user.pesel) model.set('pesel', user.pesel);
      if(user.role) model.set('role', user.role);
      if(user.email) model.set('email', user.email);
      if(user.address) model.set('address', user.address);
      if(user.postcode) model.set('postcode', user.postcode);
      if(user.voivodeship) model.set('voivodeship', user.voivodeship);
      if(user.city) model.set('city', user.city);
      if(user.pNumber) model.set('telephone', user.pNumber);
      if(user.param) model.set('assigned_to', user.param);
      if(user.isCompany) model.set('company', parseInt(user.isCompany));
      if(user.partner) model.set('isPartner', parseInt(user.partner));
      if(user.cname) model.set('cname', user.cname);
      else model.set('cname', null);
      if(user.cnip) model.set('cnip', user.cnip);
      else model.set('cnip', null);
      if(user.cregon) model.set('cregon', user.cregon);
      else model.set('cregon', null);

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

module.exports.resetPassword = (user, callback) => {
  return new User().where({ id: user.id }).fetch().then(function(model) {
    if(model) {
      var gpass = generatePassword(10, false);

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(gpass, salt, function(err, npassword) {
          model.set('password', npassword);
          model.save();

          callback({ status: 'success', message: 'Hasło użytkownika zostało poprawnie zmienione i wysłane na adres e-mail', newpassword: gpass });
        });
      });
    } else callback(Messages.message('not_found_user_identity', null));
  });
};

module.exports.resetPasswordByEmail = (email, callback) => {
  return new User().where({ email: email }).fetch().then(function(model) {
    if(model) {
      var gpass = generatePassword(10, false);

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(gpass, salt, function(err, npassword) {
          model.set('password', npassword);
          model.save();

          callback({ status: 'success', message: 'Hasło użytkownika zostało poprawnie zmienione i wysłane na adres e-mail', newpassword: gpass });
        });
      });
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
