const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const Messages = require('../config/messages');
const Notification = require('../models/notifications');
const System = require('../models/system');
const UserModel = require('../models/user');

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

module.exports.getUserByOfferId = (id, type, callback) => {
  if(type == 'leasing') {
    return new OfferLeasing().where({ id: id }).fetch({ withRelated: ['client'] })
    .then(function(result) {
      var data = result.toJSON();
      return new User().where({ id: data.client.user_id }).fetch()
      .then(function(user) {
        callback({ user_id: user.get('id'), assigned_to: user.get('assigned_to') });
      });
    });
  } else if(type == 'rent') {
    return new OfferRent().where({ id: id }).fetch({ withRelated: ['client'] })
    .then(function(result) {
      var data = result.toJSON();
      return new User().where({ id: data.client.user_id }).fetch()
      .then(function(user) {
        callback({ user_id: user.get('id'), assigned_to: user.get('assigned_to') });
      });
    });
  } else {
    return new OfferInsurance().where({ id: id }).fetch({ withRelated: ['client'] })
    .then(function(result) {
      var data = result.toJSON();
      return new User().where({ id: data.client.user_id }).fetch()
      .then(function(user) {
        callback({ user_id: user.get('id'), assigned_to: user.get('assigned_to') });
      });
    });
  }
};

module.exports.createOffer = (req, callback) => {
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
      callback('offer_' + result.get('id') + '_L_' + moment().format('YYYY'));
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
      callback('offer_' + result.get('id') + '_I_' + moment().format('YYYY'));
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
      callback('offer_' + result.get('id') + '_R_' + moment().format('YYYY'));
      Notification.sendNotificationByRole('administrator', 'flaticon2-add-square kt-font-success', 'Pracownik <b>' + req.session.userData.fullname + '</b> dodał ofertę <b>00' + result.get('id') + '/R/' + moment().format('YYYY') + '</b>.');
    });
  }
};

module.exports.companyList = (callback) => {
  return new Company().fetchAll().then(function(result) {
    callback(result);
  });
}

module.exports.changeData = (value, callback) => {
  if(value.type == 'leasing') {
    return new OfferLeasing().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        if(value.item_type_l) model.set('item_type', value.item_type_l);
        if(value.brand_l) model.set('name', value.brand_l);
        if(value.condition_l) model.set('condition', value.condition_l);
        if(value.pyear_l) model.set('production_year', value.pyear_l);
        if(value.netto_l) model.set('netto', value.netto_l);
        if(value.invoice_l) model.set('invoice', value.invoice_l);

        callback(Messages.message('offer_data_change', null));

        model.save().then(function(result) {
          // Prowizje
          module.exports.getUserByOfferId(result.get('id'), result.get('offer_type'), function(cb) {
            if(result.get('state') < 2) System.changeProvision(cb, result.get('id'), result.get('offer_type'), result.get('netto'), true, true);
            else if(result.get('state') == 2) console.log('Usuwanie prowizji..'); // Usuwanie prowizji
            else System.changeProvision(cb, result.get('id'), result.get('offer_type'), result.get('netto'), true, false);
          });

          return new LeasingVariants().where({ id: value.vid }).fetch()
          .then(function(variant) {
            if(variant) {
              if(value.contract) variant.set('okres', value.contract);
              if(value.inital_fee) variant.set('wklad', value.inital_fee);
              if(value.leasing_install) variant.set('leasing_install', value.leasing_install);
              if(value.repurchase) variant.set('wykup', value.repurchase);
              if(value.sum_fee) variant.set('total_fees', value.sum_fee);

              variant.save();
            }
          });
        });
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić dane, nie istnieje.' });
    });
  } else if(value.type == 'rent') {
    return new OfferRent().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        if(value.brand_r) model.set('marka_model', value.brand_r);
        if(value.body_type_r) model.set('typ', value.body_type_r);
        if(value.fuel_type_r) model.set('fuel_type', value.fuel_type_r);
        if(value.gear_type_r) model.set('gear_type', value.gear_type_r);
        if(value.installment_val) model.set('rata', value.installment_val);
        if(value.vehicle_val_r) model.set('netto', value.vehicle_val_r);
        if(value.rent_time_r) model.set('okres', value.rent_time_r);
        if(value.self_deposit_r) model.set('wplata', value.self_deposit_r);
        if(value.km_limit_r) model.set('limit', value.km_limit_r);
        if(value.invoice_r) model.set('invoice', value.invoice_r);

        model.save().then(function(done) {
          module.exports.getUserByOfferId(done.get('id'), done.get('offer_type'), function(cb) {
            if(done.get('state') < 2) System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, true);
            else if(done.get('state') == 2) console.log('Usuwanie prowizji..'); // Usuwanie prowizji
            else System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, false);
          });
        });
        callback(Messages.message('offer_data_change', null));

      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić dane, nie istnieje.' });
    });
  } else {
    return new OfferInsurance().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        if(value.brand_i) model.set('marka_model', value.brand_i);
        if(value.version_i) model.set('wersja', value.version_i);
        if(value.typ) model.set('body_type_i', value.body_type_i);
        if(value.pyear_i) model.set('rok_produkcji', value.pyear_i);
        if(value.km_val_i) model.set('przebieg', value.km_val_i);
        if(value.engine_cap_i) model.set('pojemnosc', value.engine_cap_i);
        if(value.power_cap_i) model.set('moc', value.power_cap_i);
        if(value.vin_number) model.set('vin_number', value.vin_number);
        if(value.reg_number) model.set('reg_number', value.reg_number);
        if(value.vehicle_val_i) model.set('netto', value.vehicle_val_i);
        if(value.insurance_cost) model.set('insurance_cost', value.insurance_cost);

        model.save().then(function(done) {
          module.exports.getUserByOfferId(done.get('id'), done.get('offer_type'), function(cb) {
            if(done.get('state') < 2) System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, true);
            else if(done.get('state') == 2) console.log('Usuwanie prowizji..'); // Usuwanie prowizji
            else System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, false);
          });
        });
        callback(Messages.message('offer_data_change', null));

      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić dane, nie istnieje.' });
    });
  }
};

module.exports.deleteOffer = (value, callback) => {
  if(value.type == 'leasing') {
    LeasingVariants.where({ offer_id: value.id }).destroy();

    return new OfferLeasing().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        callback(Messages.message('success_offer_deleted', null));
        return model.destroy();
      } else callback(Messages.message('not_found_offer', null));
    });
  } else if(value.type == 'wynajem') {
    return new OfferRent().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        callback(Messages.message('success_offer_deleted', null));
        return model.destroy();
      } else callback(Messages.message('not_found_offer', null));
    });
  } else {
    return new OfferInsurance().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        callback(Messages.message('success_offer_deleted', null));
        return model.destroy();
      } else callback(Messages.message('not_found_offer', null));
    });
  }
};

module.exports.changeStatus = (value, callback) => {
  if(value.type == 'leasing') {
    return new OfferLeasing().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        model.set('state', value.change_type);

        model.save().then(function(done) {
          module.exports.getUserByOfferId(done.get('id'), done.get('offer_type'), function(cb) {
            if(done.get('state') < 2) System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, true);
            else if(done.get('state') == 2) console.log('Usuwanie prowizji..'); // Usuwanie prowizji
            else System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, false);
          });
        });

        callback(Messages.message('offer_status_change', null));
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić status, nie istnieje.' });
    });
  } else if(value.type == 'rent') {
    return new OfferRent().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        model.set('state', value.change_type);

        model.save().then(function(done) {
          module.exports.getUserByOfferId(done.get('id'), done.get('offer_type'), function(cb) {
            if(done.get('state') < 2) System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, true);
            else if(done.get('state') == 2) console.log('Usuwanie prowizji..'); // Usuwanie prowizji
            else System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, false);
          });
        });

        callback(Messages.message('offer_status_change', null));
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić status, nie istnieje.' });
    });
  } else {
    return new OfferInsurance().where({ id: value.id }).fetch()
    .then(function(model) {
      if(model) {
        model.set('state', value.change_type);

        model.save().then(function(done) {
          module.exports.getUserByOfferId(done.get('id'), done.get('offer_type'), function(cb) {
            if(done.get('state') < 2) System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, true);
            else if(done.get('state') == 2) console.log('Usuwanie prowizji..'); // Usuwanie prowizji
            else System.changeProvision(cb, done.get('id'), done.get('offer_type'), done.get('netto'), true, false);
          });
        });

        callback(Messages.message('offer_status_change', null));
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić status, nie istnieje.' });
    });
  }
}
