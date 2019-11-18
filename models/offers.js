const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const Messages = require('../config/messages');
const Notification = require('../models/notifications');

const Client = bookshelf.Model.extend({
  tableName: 'crm_clients',
  hasTimestamps: true
});

const Company = bookshelf.Model.extend({
  tableName: 'crm_companies',
  hasTimestamps: true
});

const User = bookshelf.Model.extend({
  tableName: 'crm_users',
  hasTimestamps: true
});

const OfferLeasing = bookshelf.Model.extend({
  tableName: 'crm_offers_leasing',
  hasTimestamps: true,
  variants: function() {
    return this.belongsTo(LeasingVariants, 'id', 'offer_id');
  },
  client: function() {
    return this.belongsTo(Client, 'client_id', 'id');
  },
  company: function() {
    return this.belongsTo(Company, 'company_id', 'id');
  }
});

const LeasingVariants = bookshelf.Model.extend({
  tableName: 'crm_offers_leasing_variants',
  hasTimestamps: false
});

const OfferInsurance = bookshelf.Model.extend({
  tableName: 'crm_offers_insurance',
  hasTimestamps: true,
  client: function() {
    return this.belongsTo(Client, 'client_id', 'id');
  },
  company: function() {
    return this.belongsTo(Company, 'company_id', 'id');
  }
});

const OfferRent = bookshelf.Model.extend({
  tableName: 'crm_offers_rent',
  hasTimestamps: true,
  client: function() {
    return this.belongsTo(Client, 'client_id', 'id');
  },
  company: function() {
    return this.belongsTo(Company, 'company_id', 'id');
  }
});

module.exports.getOffers = (req, callback) => {
  var output = [];
  if(req.session.userData.role == 'administrator') {
    return new OfferLeasing()
      .fetchAll({ withRelated: ['variants', 'client', 'company'] })
      .then(function(leasing) {
        output = output.concat(leasing.toJSON());
        OfferInsurance
        .fetchAll({ withRelated: ['client', 'company'] })
        .then(function(insurance) {
          output = output.concat(insurance.toJSON());
          OfferRent
          .fetchAll({ withRelated: ['client', 'company'] })
          .then(function(rent) {
            output = output.concat(rent.toJSON());
            callback(output, output.length);
          });
        });
    });
  } else {
    return new OfferLeasing()
      .fetchAll({ withRelated: ['variants', {
        'client': function(qb) {
          qb.where('user_id', req.session.userData.id);
        }
      }, 'company'] })
      .then(function(leasing) {
        output = output.concat(leasing.toJSON());
        OfferInsurance
        .fetchAll({ withRelated: [{
          'client': function(qb) {
            qb.where('user_id', req.session.userData.id);
          }
        }, 'company'] })
        .then(function(insurance) {
          output = output.concat(insurance.toJSON());
          OfferRent
          .fetchAll({ withRelated: [{
            'client': function(qb) {
              qb.where('user_id', req.session.userData.id);
            }
          }, 'company'] })
          .then(function(rent) {
            output = output.concat(rent.toJSON());
            callback(output, output.length);
          });
        });
    });
  }
};

module.exports.getOfferById = (id, type, callback) => {
  if(type == 'rent') {
    return new OfferRent().where({ id: id }).fetch({ withRelated: ['client', 'company'] })
    .then(function(result) {
      callback(result);
    });
  } else if(type == 'insurance') {
    return new OfferInsurance().where({ id: id }).fetch({ withRelated: ['client', 'company'] })
    .then(function(result) {
      callback(result);
    });
  } else {
    return new OfferLeasing().where({ id: id }).fetch({ withRelated: ['variants', 'client', 'company'] })
    .then(function(result) {
      callback(result);
    });
  }
};

module.exports.createOffer = (req) => {
  var value = req.body;
  if(value.offer_type == 'leasing') {
    return new OfferLeasing({
      client_id: value.client_id,
      company_id: value.company_id,
      name: value.brand_l,
      production_year: value.pyear_l,
      item_type: value.item_type_l,
      condition: value.condition_l,
      netto: value.netto_l,
      invoice: value.invoice_l
    }).save().then(function(result) {
      for(var i = 0; i <= value.variant.length-1; i++) {
        new LeasingVariants({
          offer_id: result.get('id'),
          wklad: value.variant[i]['inital'],
          wykup: value.variant[i]['repurchase'],
          leasing_install: value.variant[i]['leasing_install'],
          total_fees: value.variant[i]['sum_fee'],
          okres: value.variant[i]['contract']
        }).save();
      }
      Notification.sendNotificationByRole('administrator', 'flaticon2-add-square kt-font-success', 'Pracownik <b>' + req.session.userData.fullname + '</b> dodał ofertę <b>00' + result.get('id') + '/L/' + moment().format('YYYY') + '</b>.');
    });
  } else if(value.offer_type == 'insurance') {
    return new OfferInsurance({
      client_id: value.client_id,
      company_id: value.company_id,
      marka_model: value.brand_i,
      rok_produkcji: value.pyear_i,
      wersja: value.version_i,
      pojemnosc: value.engine_cap_i,
      moc: value.power_cap_i,
      typ: value.body_type_i,
      przebieg: value.km_val_i,
      vin_number: value.vin_number,
      reg_number: value.reg_number,
      netto: value.vehicle_val_i,
      insurance_cost: value.insurance_cost
    }).save().then(function(result) {
      Notification.sendNotificationByRole('administrator', 'flaticon2-add-square kt-font-success', 'Pracownik <b>' + req.session.userData.fullname + '</b> dodał ofertę <b>00' + result.get('id') + '/I/' + moment().format('YYYY') + '</b>.');
    });
  } else {
    return new OfferRent({
      client_id: value.client_id,
      company_id: value.company_id,
      marka_model: value.brand_r,
      typ: value.body_type_r,
      fuel_type: value.fuel_type_r,
      gear_type: value.gear_type_r,
      rata: value.installment_val,
      okres: value.rent_time_r,
      netto: value.vehicle_val_r,
      wplata: value.self_deposit_r,
      limit: value.km_limit_r,
      invoice: value.invoice_r
    }).save().then(function(result) {
      Notification.sendNotificationByRole('administrator', 'flaticon2-add-square kt-font-success', 'Pracownik <b>' + req.session.userData.fullname + '</b> dodał ofertę <b>00' + result.get('id') + '/R/' + moment().format('YYYY') + '</b>.');
    });
  }
};

module.exports.companyList = (callback) => {
  return new Company().fetchAll().then(function(result) {
    callback(result);
  });
}
