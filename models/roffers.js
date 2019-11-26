const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages');
const Notification = require('../models/notifications');
const moment = require('moment');

const ROffer = bookshelf.Model.extend({
  tableName: 'crm_offer_requests',
  hasTimestamps: true,
  client_info: function() {
    return this.belongsTo(ClientRelated, 'client_id', 'id');
  }
});

const ClientRelated = bookshelf.Model.extend({
  tableName: 'crm_clients',
  hasTimestamps: true,
  feed: function() {
    return this.belongsTo(ROffer, 'id', 'client_id');
  }
});

module.exports.getClientOffers = (callback) => {
  return new ROffer()
    .fetchAll({ withRelated: ['client_info'] })
    .then(function(data) {
      ROffer.forge().count()
        .then(function(cnt) {
          callback(data, cnt);
        });
  });
};

module.exports.getClientOffersAssigned = (id, callback) => {
  return new ROffer()
    .fetchAll({ withRelated: [{
        'client_info': function(qb) {
          qb.where('user_id', id);
        }
      }]
    }).then(function(result) {
      var output = [],
      nums = 0,
      data_json = result.toJSON();

      data_json.forEach(function(item) {
        if(item.client_info.id != null) {
          output.push(item);
          nums++;
        }
      });

      callback(output, nums);
    });
};

module.exports.getOfferById = (id, callback) => {
  return new ROffer()
    .where({ id: id })
    .fetch({ withRelated: ['client_info'] })
    .then(function(data) {
      callback(data);
    });
};

module.exports.addOffer = (value, callback) => {
  if(value.client_type == 0) {
    return new ClientRelated({
      fullname: value.firstname + ' ' + value.lastname,
      nip: value.nip,
      phone: value.phone,
      email: value.email,
      company: value.client_type
    }).save().then(function(result) {
      return new ROffer({
        client_id: result.get('id'),
        type: value.offer_type,
        name: value.nameItem,
        pyear: value.pyear_l,
        netto: value.netto_l,
        instalments: value.leasing_install,
        contribution: value.wklad_l,
        red_value: value.wykup_l,
        attentions: value.attentions,
        other: value.other
      }).save().then(function(done) {
        Notification.sendNotificationByRole('administrator', 'flaticon2-user kt-font-success', 'Klient <b>' + result.get('fullname') + '</b> utworzył nowe zapytanie ofertowe <b>00' + done.get('id') + '/' + moment().format('YYYY') + '</b>');
        callback({ status: 'success', message: 'Twoje zapytanie ofertowe zostało złożone' });
      });
    });
  } else {
    return new ClientRelated({
      fullname: value.companyName,
      nip: value.nip,
      regon: value.regon,
      phone: value.phone,
      email: value.email,
      company: value.client_type,
      company_type: value.company_type
    }).save().then(function(result) {
      return new ROffer({
        client_id: result.get('id'),
        type: value.offer_type,
        name: value.nameItem,
        pyear: value.pyear_l,
        netto: value.netto_l,
        instalments: value.leasing_install,
        contribution: value.wklad_l,
        red_value: value.wykup_l,
        attentions: value.attentions,
        other: value.other
      }).save().then(function(done) {
        Notification.sendNotificationByRole('administrator', 'flaticon2-user kt-font-success', 'Klient <b>' + result.get('fullname') + '</b> utworzył nowe zapytanie ofertowe <b>00' + done.get('id') + '/' + moment().format('YYYY') + '</b>');
        callback({ status: 'success', message: 'Twoje zapytanie ofertowe zostało złożone' });
      });
    });
  }
};
