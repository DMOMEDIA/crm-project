const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const fs = require('fs');
const randomstring = require("randomstring");
const Messages = require('../config/messages');
const System = require('../models/system');
const User = require('../models/user');
const Offer = require('../models/offers');
const ROffer = require('../models/roffers');
const Notification = require('../models/notifications');
const Mails = require('../controllers/Mails');
const Promise = require('bluebird');
const async = require('async');
const generatePassword = require('password-generator');

const Client = bookshelf.Model.extend({
  tableName: 'crm_clients',
  hasTimestamps: true
});

module.exports.getClientByEmail = (email) => {
  const query = { email: email };
  return new Client().where(query).fetch();
};

module.exports.comparePassword = (candidatePassword, password, callback) => {
  bcrypt.compare(candidatePassword, password, function(err, isMatch) {
    callback(null, isMatch);
  });
};

module.exports.createClient = (client, callback) => {
  var gpass = generatePassword(10, false);
  // Checking if client is exists
  module.exports.getClientByEmail(client.email).then(function(email) {
    if(!email) {
      if(client.client_type == 0) {
        var clientname = client.firstname + ' ' + client.lastname;
        if(client.priv_nip) var nip = client.priv_nip;
        var regon = null;
      } else if(client.client_type == 1) {
        var clientname = client.corpName,
        nip = client.corp_nip;
        if(client.corp_regon) var regon = client.corp_regon;
        ;
      } else {
        var clientname = client.companyName,
        nip = client.company_nip;
        if(client.company_regon) var regon = client.company_regon;
      }

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(gpass, salt, function(err, npassword) {
          return new Client({
            fullname: clientname,
            regon: regon,
            nip: nip,
            phone: client.phone,
            email: client.email,
            password: npassword,
            company: client.client_type,
            company_type: client.corp_type,
            state: 4,
            user_id: client.param,
            data_process: client.data_processing,
            marketing: client.data_marketing,
            hashlink: randomstring.generate(128)
          }).save().then(function(done) {
            callback({ status: 'success', newpw: gpass });
          });
        });
      });
    } else {
      callback({ status: 'error' });
    }
  });
};

module.exports.deleteClient = (id, callback) => {
  return new Client().where({ id: id }).fetch({ require: true }).then(function(model) {
    if(model) {
      callback(Messages.message('success_client_deleted', null));
      return model.destroy();
    } else callback(Messages.message('not_found_client_identity', null));
  });
};

module.exports.clientList = (callback) => {
  return new Client().fetchAll().then(function(response) {
    Client.forge().count().then(function(cnt) {
      callback(response, cnt);
    });
  });
};

function getFilesFromDir(dirpath, callback) {
  var files = fs.readdirSync('./uploads/' + dirpath), output = [];

  async.each(files, function(name, cb) {
    var stats = fs.statSync('./uploads/' + dirpath + '/' + name);
    output.push({ filename: name, filesize: stats['size'], path: dirpath });
    cb();
  }, function() {
    callback(output);
  });
}

module.exports.clientlistByAssignedId = (id, callback) => {
  var output = [];
  return new Client().where({ user_id: id }).fetchAll().then(function(response) {
    output = output.concat(response.toJSON());

    User.userListByAssignedId(['id','fullname','role', 'assigned_to'], id, function(done, cnt) {
      if(done) {
        var counter = 0;

        async.each(done, async function(element, next) {
          await Client.where({ user_id: element.id }).fetchAll().then(function(result) {
            if(result) {
              var data = result.toJSON();

              data.forEach(async function(element) {
                var modify = element;
                modify['inferior'] = true;

                await output.push(modify);
              });
              counter++;
            }
          });
          if(cnt == counter) next();
        }, function() {
          callback(output, output.length);
        });
      } else callback(output, output.length);
    });
  });
};

module.exports.getClientById = (id) => {
  const query = { id: id };
  return new Client().where(query).fetch();
};

module.exports.getClientFiles = (id, callback) => {
  module.exports.getClientById(id).then(function(client) {
    var path_to = 'clients/client_' + id + '_' + moment(client.get('created_at')).local().format('YYYY');

    getFilesFromDir(path_to, filelist => {
      callback(filelist);
    });
  });
};

module.exports.activateAccount = (hash, callback) => {
  var gpass = generatePassword(10, false);
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(gpass, salt, function(err, genpassword) {
      return new Client().where({ hashlink: hash }).fetch()
      .then(function(model) {
        if(model) {
          if(model.get('state') != 4) {
            model.set('state', 4);

            var passwordIsset = false;
            if(model.get('password') == null) {
              passwordIsset = true;
              model.set('password', genpassword);
            }

            model.save().then(function(result) {
              if(passwordIsset) {
                Mails.sendMail.send({
                  template: 'client_data',
                  message: {
                    from: '"Wsparcie dla biznesu" <kontakt@wsparciedlabiznesu.eu>',
                    to: result.get('email'),
                    subject: 'Dane logowania do panelu klienta'
                  },
                  locals: {
                    login: result.get('email'),
                    password: gpass
                  }
                });
                callback({ status: 'success', val: 'activated', message: 'Konto klienta zostało pomyślnie aktywowane.' });
              }
            });
          } else callback({ status: 'error', val: 'is_activated', message: 'To konto zostało już aktywowane.' });
        } else callback({ status: 'error', val: 'not_found', message: 'Konto klienta nie zostało odnalezione.' });
      });
    });
  });
};

module.exports.saveClientData = (req, callback) => {
  var client = req.body, user_defined = false;
  return new Client().where({ id: client.id }).fetch().then(function(model) {
    if(model) {
      if(client.client_type == 0) {
        if(client.firstname && client.lastname) model.set('fullname', client.firstname + ' ' + client.lastname);
        if(client.priv_nip) model.set('nip', client.priv_nip);
        model.set('company', client.client_type);
      }
      else if(client.client_type == 1) {
        if(client.corpName) model.set('fullname', client.corpName);
        if(client.corp_type) model.set('company_type', client.corp_type);
        if(client.corp_regon) model.set('regon', client.corp_regon);
        else model.set('regon', null);
        if(client.corp_nip) model.set('nip', client.corp_nip);
        model.set('company', client.client_type);
      } else {
        model.set('company', client.client_type);
        if(client.companyName) model.set('fullname', client.companyName);
        if(client.company_regon) model.set('regon', client.company_regon);
        else model.set('regon', null);
        if(client.company_nip) model.set('nip', client.company_nip);
      }

      if(client.pNumber) model.set('phone', client.pNumber);
      if(client.email) model.set('email', client.email);
      if(client.data_processing) model.set('data_process', client.data_processing);
      else model.set('data_process', 0);
      if(client.data_marketing) model.set('marketing', client.data_marketing);
      else model.set('marketing', 0);

      if(client.param) {
        if(model.get('user_id') != client.param) user_defined = true;

        model.set('user_id', client.param);
        if(model.get('state') != 4) {
          if(model.get('nip')) {
            model.set('state', 3);
          } else model.set('state', 2);
        }
      }

      model.save().then(function(done) {
        if(user_defined == true) Notification.sendNotificationToUser(done.get('user_id'), 'flaticon-users-1 kt-font-success', 'Klient <b>' + done.get('fullname').trunc(25) + '</b> został przypisany do Twojej obsługi.');
        System.createLog('modify_client_log', 'Modyfikacja klienta ' + done.get('fullname') + ' przez (USER=' + req.session.userData.id + ')');
        callback(Messages.message('success_updated_client', null));
      });
    } else callback(Messages.message('not_found_client_identity', null));
  });
};

module.exports.changeStatus = (value, callback) => {
  return new Client().where({ id: value.id }).fetch()
  .then(function(model) {
    if(model) {
      model.set('state', value.change_status);

      model.save().then(function(done) {
        callback(Messages.message('client_status_change', null));
      });
    } else callback({ status: 'error', message: 'Klient dla którego chcesz zmienić status, nie istnieje.' });
  });
};
