const bookshelf = require('../config/bookshelf');
const randomstring = require("randomstring");
const bcrypt = require('bcryptjs');
const moment = require('moment');
const crypto = require('crypto');
const Messages = require('../config/messages');
const Notification = require('../models/notifications');
const ClientsModel = require('../models/clients');
const Mails = require('../controllers/Mails');

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

module.exports.deleteROffer = (id, callback) => {
  return new ROffer().where({ id: id }).fetch().then(function(model) {
    if(model) {
      callback(Messages.message('success_roffer_delete', null));
      return model.destroy();
    } else callback(Messages.message('not_found_roffer', null));
  });
};

module.exports.setValueById = (id, name, data) => {
  return new ROffer().where({ id: id }).fetch()
  .then(function(model) {
    if(model) {
      if(data) model.set(name, data);
      model.save();
    }
  });
};

module.exports.uploadOffer = (value, callback) => {
  if(value.type == 'leasing') {
    return new ROffer().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        if(value.nameItem) model.set('name', value.nameItem);
        if(value.pyear_l) model.set('pyear', value.pyear_l);
        if(value.leasing_installment) model.set('instalments', value.leasing_installment);
        if(value.wklad_l) model.set('contribution', value.wklad_l);
        if(value.wykup_l) model.set('red_value', value.wykup_l);
        if(value.netto) model.set('netto', value.netto);
        if(value.attentions) model.set('attentions', value.attentions);
        if(value.other) model.set('other', value.other);

        model.save().then(function(done) {
          callback(Messages.message('request_offer_data_change', null));
        });
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić dane, nie istnieje.' });
    });
  } else if(value.type == 'rent') {
    return new ROffer().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        if(value.brand_r) model.set('name', value.brand_r);
        if(value.installment_val) model.set('installment_val', value.installment_val);
        if(value.body_type_r) model.set('body_type', value.body_type_r);
        if(value.fuel_type_r) model.set('fuel_type', value.fuel_type_r);
        if(value.rent_installment) model.set('instalments', value.rent_installment);
        if(value.wklad_r) model.set('contribution', value.wklad_r);
        if(value.wykup_r) model.set('red_value', value.wykup_r);
        if(value.service_pack) model.set('service', value.service_pack);
        else model.set('service', 0);
        if(value.tire_pack) model.set('tire', value.tire_pack);
        else model.set('tire', 0);
        if(value.insurance_pack) model.set('insurance', value.insurance_pack);
        else model.set('insurance', 0);
        if(value.netto) model.set('netto', value.netto);
        if(value.attentions) model.set('attentions', value.attentions);
        if(value.other) model.set('other', value.other);

        model.save().then(function(done) {
          callback(Messages.message('request_offer_data_change', null));
        });
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić dane, nie istnieje.' });
    });
  } else {
    return new ROffer().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        if(value.brand_i) model.set('name', value.brand_i);
        if(value.pyear_i) model.set('pyear', value.pyear_i);
        if(value.engine_cap_i) model.set('engine_cap', value.engine_cap_i);
        if(value.power_cap_i) model.set('power_cap', value.power_cap_i);
        if(value.vin_number) model.set('vin', value.vin_number);
        if(value.reg_number) model.set('reg_number', value.reg_number);
        if(value.km_val_i) model.set('km_value', value.km_val_i);
        if(value.netto) model.set('netto', value.netto);
        if(value.attentions) model.set('attentions', value.attentions);
        if(value.other) model.set('other', value.other);

        model.save().then(function(done) {
          callback(Messages.message('request_offer_data_change', null));
        });
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić dane, nie istnieje.' });
    });
  }
};

module.exports.addOfferBySystem = (value, callback) => {
  if(value.offer_type == 'leasing') {
    function get_req() {
      return {
        client_id: value.client_id,
        type: value.offer_type,
        name: value.nameItem,
        pyear: value.pyear_l,
        netto: value.netto,
        instalments: value.leasing_installment,
        contribution: value.wklad_l,
        red_value: value.wykup_l,
        attentions: value.attentions,
        other: value.other
      }
    }
  } else if(value.offer_type == 'rent') {
    function get_req() {
      return {
        client_id: value.client_id,
        type: value.offer_type,
        name: value.brand_r,
        installment_val: value.installment_val,
        body_type: value.body_type_r,
        fuel_type: value.fuel_type_r,
        instalments: value.rent_installment,
        contribution: value.wklad_r,
        red_value: value.wykup_r,
        service: value.service_pack,
        tire: value.tire_pack,
        insurance: value.insurance_pack,
        netto: value.netto,
        attentions: value.attentions,
        other: value.other
      }
    }
  } else {
    function get_req() {
      return {
        client_id: value.client_id,
        type: value.offer_type,
        name: value.brand_i,
        pyear: value.pyear_i,
        engine_cap: value.engine_cap_i,
        power_cap: value.power_cap_i,
        vin: value.vin_number,
        reg_number: value.reg_number,
        km_value: value.km_val_i,
        netto: value.netto,
        attentions: value.attentions,
        other: value.other
      }
    }
  }

  return new ROffer(get_req()).save().then(function(done) {
    ClientsModel.getClientById(value.client_id).then(function(result) {

      Notification.sendNotificationByRole('administrator', 'flaticon2-user kt-font-success', 'Zapytanie ofertowe <b>00' + done.get('id') + '/' + moment().format('YYYY') + '</b> zostało dodane do klienta <b>' + result.get('fullname') + '</b>');
      callback(Messages.message('success_roffer_add', null));
    });
  });
};

module.exports.addOffer = (value, callback) => {
  if(!value.data_processing) value.data_processing = 0;
  if(!value.marketing_agree) value.marketing_agree = 0;

  if(value.client_type == 0) {
    var c_type = {
      fullname: value.firstname + ' ' + value.lastname,
      nip: value.priv_nip,
      phone: value.phone,
      email: value.email,
      company: value.client_type,
      ip_address: value.ip_address,
      data_process: value.data_processing,
      marketing: value.marketing_agree,
      hashlink: randomstring.generate(128)
    }
  } else if(value.client_type == 1) {
    var c_type = {
      fullname: value.corpName,
      nip: value.corp_nip,
      regon: value.corp_regon,
      phone: value.phone,
      email: value.email,
      company: value.client_type,
      company_type: value.corp_type,
      ip_address: value.ip_address,
      data_process: value.data_processing,
      marketing: value.marketing_agree,
      hashlink: randomstring.generate(128)
    }
  } else {
    var c_type = {
      fullname: value.companyName,
      nip: value.company_nip,
      regon: value.company_regon,
      phone: value.phone,
      email: value.email,
      company: value.client_type,
      company_type: value.company_type,
      ip_address: value.ip_address,
      data_process: value.data_processing,
      marketing: value.marketing_agree,
      hashlink: randomstring.generate(128)
    }
  }

  if(value.offer_type == 'leasing') {
    function get_req(id) {
      return {
        client_id: id,
        type: value.offer_type,
        name: value.nameItem,
        pyear: value.pyear_l,
        netto: value.netto_l,
        instalments: value.leasing_install,
        contribution: value.wklad_l,
        red_value: value.wykup_l,
        attentions: value.attentions,
        other: value.other
      }
    }
  } else if(value.offer_type == 'rent') {
    function get_req(id) {
      return {
        client_id: id,
        type: value.offer_type,
        name: value.brand_r,
        installment_val: value.installment_val,
        body_type: value.body_type_r,
        fuel_type: value.fuel_type_r,
        instalments: value.rent_install,
        contribution: value.wklad_r,
        red_value: value.wykup_r,
        service: value.service_r,
        tire: value.tires_r,
        insurance: value.insurance_r,
        netto: value.netto_l,
        attentions: value.attentions,
        other: value.other
      }
    }
  } else {
    function get_req(id) {
      return {
        client_id: id,
        type: value.offer_type,
        name: value.brand_i,
        pyear: value.pyear_i,
        engine_cap: value.engine_cap_i,
        power_cap: value.power_cap_i,
        vin: value.vin_number,
        reg_number: value.reg_number,
        km_value: value.km_val_i,
        netto: value.netto_l,
        attentions: value.attentions,
        other: value.other
      }
    }
  }

  var link = 'https://wsparciedlabiznesu.eu/activation/?p=';
  ClientsModel.getClientByEmail(c_type.email).then(function(client) {
    if(client) {
      client = client.toJSON();
      return new ROffer(get_req(client.id)).save().then(function(done) {
        Notification.sendNotificationByRole('administrator', 'flaticon2-user kt-font-success', 'Klient <b>' + client.fullname + '</b> utworzył nowe zapytanie ofertowe <b>00' + done.get('id') + '/' + moment().format('YYYY') + '</b>');
        Mails.sendMail.send({
          template: 'roffer_send',
          message: {
            from: '"Wsparcie dla biznesu" <kontakt@wsparciedlabiznesu.eu>',
            to: client.email,
            subject: 'Zapytanie ofertowe zostało złożone'
          },
          locals: {
            client_name: client.fullname,
            identity: '00' + done.get('id') + '/' + moment().format('YYYY'),
            hashlink: link + client.hashlink,
            isActivated: (client.state == 4) ? true : false
          }
        });
        callback({ status: 'success', message: 'Twoje zapytanie ofertowe zostało złożone' });
      });
    } else {
      return new ClientRelated(c_type).save().then(function(result) {
        return new ROffer(get_req(result.get('id'))).save().then(function(done) {
          Notification.sendNotificationByRole('administrator', 'flaticon2-user kt-font-success', 'Klient <b>' + result.get('fullname') + '</b> utworzył nowe zapytanie ofertowe <b>00' + done.get('id') + '/' + moment().format('YYYY') + '</b>');
          Mails.sendMail.send({
            template: 'roffer_send',
            message: {
              from: '"Wsparcie dla biznesu" <kontakt@wsparciedlabiznesu.eu>',
              to: result.get('email'),
              subject: 'Zapytanie ofertowe zostało złożone'
            },
            locals: {
              client_name: result.get('fullname'),
              identity: '00' + done.get('id') + '/' + moment().format('YYYY'),
              hashlink: link + result.get('hashlink'),
              isActivated: false
            }
          });
          callback({ status: 'success', message: 'Twoje zapytanie ofertowe zostało złożone' });
        });
      });
    }
  });
};
