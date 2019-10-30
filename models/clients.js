const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages');

const Client = bookshelf.Model.extend({
  tableName: 'crm_clients',
  hasTimestamps: true
});

module.exports.createClient = (client) => {
  if(client.company == 0) {
    return new Client({
      fullname: client.fullname,
      pesel: client.pesel,
      phone: client.phone,
      email: client.email,
      company: client.company,
      state: client.state,
      user_id: client.user_id
    }).save();
  } else {
    return new Client({
      fullname: client.companyName,
      nip: client.nip,
      phone: client.phone,
      email: client.email,
      company: client.company,
      state: client.state,
      user_id: client.user_id
    }).save();
  }
};

module.exports.clientList = (callback) => {
  return new Client().fetchAll().then(function(response) {
    Client.forge().count().then(function(cnt) {
      callback(response, cnt);
    });
  });
};

module.exports.clientlistByAssignedId = (id, callback) => {
  return new Client().where({ user_id: id }).fetchAll().then(function(response) {
    Client.where({ user_id: id }).count().then(function(cnt) {
      callback(response, cnt);
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
        model.set('company', client.client_type);
        if(client.firstname && client.lastname) model.set('fullname', client.firstname + ' ' + client.lastname);
      } else {
        model.set('company', client.client_type);
        if(client.companyname) model.set('fullname', client.companyname);
        if(client.nip) model.set('nip', client.nip);
      }

      if(client.pesel) model.set('pesel', client.pesel);
      if(client.pNumber) model.set('phone', client.pNumber);
      if(client.email) model.set('email', client.email);

      if(req.session.userData.role == 'administrator') {
        if(client.param) {
          model.set('user_id', client.param);
          if(client.client_type == 0 && model.get('pesel') != null) {
            model.set('state', 2);
          } else if(client.client_type == 1 && model.get('nip') != null) {
            model.set('state', 2);
          } else model.set('state', 1);
        }
      } else if(model.get('user_id') == req.session.userData.id) {
        if(client.param) {
          if(client.client_type == 0 && model.get('pesel') != null) {
            model.set('state', 2);
          } else if(client.client_type == 1 && model.get('nip') != null) {
            model.set('state', 2);
          } else model.set('state', 1);
        }
      }

      model.save();

      callback(Messages.message('success_updated_client', null));
    } else callback(Messages.message('not_found_client_identity', null));
  });
};
