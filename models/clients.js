const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages');
const System = require('../models/system');
const User = require('../models/user');
const async = require('async');

const Client = bookshelf.Model.extend({
  tableName: 'crm_clients',
  hasTimestamps: true
});

module.exports.createClient = (client) => {
  return new Client({
    fullname: client.fullname,
    nip: client.nip,
    phone: client.phone,
    email: client.email,
    company: client.company,
    company_type: client.company_type,
    state: client.state,
    user_id: client.user_id
  }).save();
};

module.exports.clientList = (callback) => {
  return new Client().fetchAll().then(function(response) {
    Client.forge().count().then(function(cnt) {
      callback(response, cnt);
    });
  });
};

module.exports.clientlistByAssignedId = (id, callback) => {
  var output = [];
  return new Client().where({ user_id: id }).fetchAll().then(function(response) {
    output = output.concat(response.toJSON());

    User.userListByAssignedId(null, id, function(done, cnt) {
      if(done) {
        var data_json = done.toJSON(), counter = 0;

        async.each(data_json, async function(element, next) {
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

module.exports.saveClientData = (req, callback) => {
  var client = req.body;
  return new Client().where({ id: client.id }).fetch().then(function(model) {
    if(model) {
      if(client.client_type == 0) {
        if(client.firstname && client.lastname) model.set('fullname', client.firstname + ' ' + client.lastname);
        model.set('company', client.client_type);
      }
      else if(client.client_type == 1) {
        if(client.corpName) model.set('fullname', client.corpName);
        if(client.corp_type) model.set('company_type', client.corp_type);
        if(client.corp_regon) model.set('regon', client.corp_regon);
        model.set('company', client.client_type);
      } else {
        model.set('company', client.client_type);
        if(client.companyName) model.set('fullname', client.companyName);
        if(client.company_regon) model.set('regon', client.company_regon);
      }

      if(client.nip) model.set('nip', client.nip);
      if(client.pNumber) model.set('phone', client.pNumber);
      if(client.email) model.set('email', client.email);
      if(client.data_processing) model.set('data_process', client.data_processing);
      if(client.data_marketing) model.set('marketing', client.data_marketing);

      if(client.param) {
        model.set('user_id', client.param);
        if(model.get('state') != 4) {
          if(model.get('nip')) {
            model.set('state', 3);
          } else model.set('state', 2);
        }
      }

      model.save().then(function(done) {
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
