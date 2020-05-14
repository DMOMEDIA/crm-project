const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const async = require('async');
const path = require('path');
const fs = require('fs');
const Messages = require('../config/messages');
const Notification = require('../models/notifications');
const System = require('../models/system');
const UserModel = require('../models/user');
const ClientModel = require('../models/clients');
const RequestOffers = require('../models/roffers');

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

const ROffer = bookshelf.Model.extend({
  tableName: 'crm_offer_requests',
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

module.exports.getOfferCounts = (callback) => {
  return new OfferLeasing().count().then(function(cnt_leasing) {
    return new OfferRent().count().then(function(cnt_rent) {
      return new OfferInsurance().count().then(function(cnt_insurance) {
        var elements = [
          {
            label: 'leasing',
            value: cnt_leasing
          },
          {
            label: 'wynajem',
            value: cnt_rent
          },
          {
            label: 'ubezp.',
            value: cnt_insurance
          }
        ];

        callback(elements);
      });
    });
  });
};

module.exports.savePartnerProvision = (user_id, values, callback) => {
  if(values.offer_type == 'leasing') {
    return new OfferLeasing().where({ id: values.offer_id }).fetch()
    .then(function(model) {
      if(model) {
        if(model.get('state') < 4) {
          if(values.partner_prov.length != 0) model.set('prov_partner', values.partner_prov);
          else model.set('prov_partner', null);
          if(values.agent_prov.length != 0) model.set('prov_agent', values.agent_prov);
          else model.set('prov_agent', null);
          if(values.employee_prov.length != 0) model.set('prov_employee', values.employee_prov);
          else model.set('prov_employee', null);

          model.save().then(function(done) {
            if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
            else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
            else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);

            if(user_id != done.get('created_by'))
              Notification.sendNotificationToUser(done.get('created_by'), 'flaticon2-percentage kt-font-success', 'Twój kierownik ustalił prowizję dla oferty <b>00' + done.get('id') + '/' + done.get('offer_type').charAt(0) + '/' + moment(done.get('created_at')).local().format('YYYY') + '</b>, możesz ją wysłać do klienta.');

            System.getOfferProvision(values.offer_id + '/' + values.offer_type, user_id, function(result) {
              if(result) callback({ status: 'success', message: 'Prowizja została pomyślnie nadana.', your_prov: result });
              else callback({ status: 'success', message: 'Prowizja została pomyślnie nadana.', your_prov: '0.00' });
            });
          });
        } else callback({ status: 'error', message: 'Nie możesz edytować prowizji dla zrealizowanej oferty.' });
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz przypisać prowizje, nie istnieje.' });
    });
  } else if(values.offer_type == 'rent') {
    return new OfferRent().where({ id: values.offer_id }).fetch()
    .then(function(model) {
      if(model) {
        if(model.get('state') < 4) {
          if(values.partner_prov.length != 0) model.set('prov_partner', values.partner_prov);
          else model.set('prov_partner', null);
          if(values.agent_prov.length != 0) model.set('prov_agent', values.agent_prov);
          else model.set('prov_agent', null);
          if(values.employee_prov.length != 0) model.set('prov_employee', values.employee_prov);
          else model.set('prov_employee', null);

          model.save().then(function(done) {
            if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
            else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
            else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);

            if(user_id != done.get('created_by'))
              Notification.sendNotificationToUser(done.get('created_by'), 'flaticon2-percentage kt-font-success', 'Twój kierownik ustalił prowizję dla oferty <b>00' + done.get('id') + '/' + done.get('offer_type').charAt(0) + '/' + moment(done.get('created_at')).local().format('YYYY') + '</b>, możesz ją wysłać do klienta.');

            System.getOfferProvision(values.offer_id + '/' + values.offer_type, user_id, function(result) {
              if(result) callback({ status: 'success', message: 'Prowizja została pomyślnie nadana.', your_prov: result });
              else callback({ status: 'success', message: 'Prowizja została pomyślnie nadana.', your_prov: '0.00' });
            });
          });
        } else callback({ status: 'error', message: 'Nie możesz edytować prowizji dla zrealizowanej oferty.' });
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz przypisać prowizje, nie istnieje.' });
    });
  } else {
    return new OfferInsurance().where({ id: values.offer_id }).fetch()
    .then(function(model) {
      if(model) {
        if(model.get('state') < 4) {
          if(values.partner_prov.length != 0) model.set('prov_partner', values.partner_prov);
          else model.set('prov_partner', null);
          if(values.agent_prov.length != 0) model.set('prov_agent', values.agent_prov);
          else model.set('prov_agent', null);
          if(values.employee_prov.length != 0) model.set('prov_employee', values.employee_prov);
          else model.set('prov_employee', null);

          model.save().then(function(done) {
            if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
            else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
            else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);

            if(user_id != done.get('created_by'))
              Notification.sendNotificationToUser(done.get('created_by'), 'flaticon2-percentage kt-font-success', 'Twój kierownik ustalił prowizję dla oferty <b>00' + done.get('id') + '/' + done.get('offer_type').charAt(0) + '/' + moment(done.get('created_at')).local().format('YYYY') + '</b>, możesz ją wysłać do klienta.');

            System.getOfferProvision(values.offer_id + '/' + values.offer_type, user_id, function(result) {
              if(result) callback({ status: 'success', message: 'Prowizja została pomyślnie nadana.', your_prov: result });
              else callback({ status: 'success', message: 'Prowizja została pomyślnie nadana.', your_prov: '0.00' });
            });
          });
        } else callback({ status: 'error', message: 'Nie możesz edytować prowizji dla zrealizowanej oferty.' });
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz przypisać prowizje, nie istnieje.' });
    });
  }
};

module.exports.setValueById = (id, type, name, data) => {
  if(type == 'leasing') {
    return new OfferLeasing().where({ id: id }).fetch()
    .then(function(model) {
      if(model) {
        if(data) model.set(name, data);
        model.save().then(function(done) {
          if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
          else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
          else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);
        });
      }
    });
  } else if(type == 'rent') {
    return new OfferRent().where({ id: id }).fetch()
    .then(function(model) {
      if(model) {
        if(data) model.set(name, data);
        model.save().then(function(done) {
          if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
          else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
          else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);
        });
      }
    });
  } else {
    return new OfferInsurance().where({ id: id }).fetch()
    .then(function(model) {
      if(model) {
        if(data) model.set(name, data);
        model.save().then(function(done) {
          if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
          else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
          else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);
        });
      }
    });
  }
};

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
    ClientModel.clientlistByAssignedId(req.session.userData.id, function(result, nums) {
      var output = [];
      if(result) {
        var counter = 0;

        async.each(result, async function(e, cb) {
          await new OfferLeasing().where({ client_id: e.id }).fetchAll({ withRelated: ['variants','client','company'] })
          .then(async function(leasing) {
            if(leasing) {
              output = output.concat(leasing.toJSON());
              await OfferInsurance.where({ client_id: e.id }).fetchAll({ withRelated: ['client','company'] })
              .then(async function(insurance) {
                if(insurance) {
                  output = output.concat(insurance.toJSON());
                  await OfferRent.where({ client_id: e.id }).fetchAll({ withRelated: ['client','company'] })
                  .then(function(rent) {
                    if(rent) {
                      output = output.concat(rent.toJSON());
                      counter++;
                    }
                  });
                }
              });
            }
          });
          if(nums == counter) cb();
        }, function() {
          callback(output, output.length);
        });
      }
    });
  }
};

module.exports.getOffersByClientId = (client_id, callback) => {
  var output = [];
  return new OfferLeasing()
    .where({ client_id: client_id }).fetchAll({ withRelated: ['company'] })
    .then(async function(leasing) {
      output = output.concat(leasing.toJSON());
      OfferInsurance.where({ client_id: client_id }).fetchAll({ withRelated: ['company'] })
      .then(async function(insurance) {
        output = output.concat(insurance.toJSON());
        OfferRent.where({ client_id: client_id }).fetchAll({ withRelated: ['company'] })
        .then(async function(rent) {
          output = output.concat(rent.toJSON());

          callback(output);
        });
      });
    });
};

/* module.exports.getOffersByClientId = (client_id, callback) => {
  var output = [];
  return new OfferLeasing()
    .where({ client_id: client_id }).fetchAll({ withRelated: ['company'] })
    .then(async function(leasing) {
      leasing = leasing.toJSON();

      async.eachOf(leasing, function(item, key, cb) {
        var buildPath = './uploads/offer/offer_' + leasing[key].id + '_' + leasing[key].offer_type.charAt(0).toUpperCase() + '_' + moment(leasing[key].created_at).local().format('YYYY');

        getFilesFromDir(buildPath, result => {
          leasing[key].files = result;
        });

        cb();
      }, function() {
        output = output.concat(leasing);
        OfferInsurance.where({ client_id: client_id }).fetchAll({ withRelated: ['company'] })
        .then(async function(insurance) {
          insurance = insurance.toJSON();

          async.eachOf(insurance, function(item, key, cb) {
            var buildPath = './uploads/offer/offer_' + insurance[key].id + '_' + insurance[key].offer_type.charAt(0).toUpperCase() + '_' + moment(insurance[key].created_at).local().format('YYYY');

            getFilesFromDir(buildPath, result => {
              insurance[key].files = result;
            });

            cb();
          }, function() {
            output = output.concat(insurance);
            OfferRent.where({ client_id: client_id }).fetchAll({ withRelated: ['company'] })
            .then(async function(rent) {
              rent = rent.toJSON();

              async.eachOf(rent, function(item, key, cb) {
                var buildPath = './uploads/offer/offer_' + rent[key].id + '_' + rent[key].offer_type.charAt(0).toUpperCase() + '_' + moment(rent[key].created_at).local().format('YYYY');

                getFilesFromDir(buildPath, result => {
                  rent[key].files = result;
                });

                cb();
              }, function() {
                output = output.concat(rent);

                callback(output);
              });
            });
          });
        });
      });
    });
}; */

module.exports.getOfferById = (id, type, callback) => {
  if(type == 'rent') {
    return new OfferRent().where({ id: id }).fetch({ withRelated: ['client', 'company'] })
    .then(function(result) {
      if(result) callback(result.toJSON());
    });
  } else if(type == 'insurance') {
    return new OfferInsurance().where({ id: id }).fetch({ withRelated: ['client', 'company'] })
    .then(function(result) {
      if(result) callback(result.toJSON());
    });
  } else {
    return new OfferLeasing().where({ id: id }).fetch({ withRelated: ['client', 'company'] })
    .then(function(result) {
      if(result) {
        var data = result.toJSON();

        new LeasingVariants().where({ offer_id: data.id }).fetchAll()
        .then(function(variants) {
          if(variants) data['variants'] = variants.toJSON();

          callback(data);
        });
      }
    });
  }
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

module.exports.getOfferWithFilesById = (id, type, callback) => {
  if(type == 'rent') {
    return new OfferRent().where({ id: id }).fetch({ withRelated: ['company'] })
    .then(function(result) {
      if(result) {
        result = result.toJSON();
        var buildPath = 'offer/offer_' + result.id + '_' + result.offer_type.charAt(0).toUpperCase() + '_' + moment(result.created_at).local().format('YYYY');

        getFilesFromDir(buildPath, cb => {
          result.files = cb;

          callback(result);
        });
      }
    });
  } else if(type == 'insurance') {
    return new OfferInsurance().where({ id: id }).fetch({ withRelated: ['company'] })
    .then(function(result) {
      if(result) {
        result = result.toJSON();
        var buildPath = 'offer/offer_' + result.id + '_' + result.offer_type.charAt(0).toUpperCase() + '_' + moment(result.created_at).local().format('YYYY');

        getFilesFromDir(buildPath, cb => {
          result.files = cb;

          callback(result);
        });
      }
    });
  } else {
    return new OfferLeasing().where({ id: id }).fetch({ withRelated: ['company'] })
    .then(function(result) {
      if(result) {
        var data = result.toJSON();
        var buildPath = 'offer/offer_' + data.id + '_' + data.offer_type.charAt(0).toUpperCase() + '_' + moment(data.created_at).local().format('YYYY');

        LeasingVariants.where({ offer_id: data.id }).fetchAll()
        .then(function(variants) {
          data['variants'] = variants.toJSON();

          getFilesFromDir(buildPath, cb => {
            data.files = cb;

            callback(data);
          });
        });
      }
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

module.exports.createOffer = (req, partner_val, callback) => {
  var value = req.body, p_val = null;
  if(partner_val) p_val = partner_val + ' %';
  if(value.offer_type == 'leasing') {
    if(value.acoc_rata_l.length == 0) value.acoc_rata_l = null;
    if(value.gap_rata_l.length == 0) value.gap_rata_l = null;
    if(value.attentions_l.length == 0) value.attentions_l = null;
    return new OfferLeasing({
      client_id: value.client_id,
      company_id: value.company_id,
      name: value.brand_l,
      production_year: value.pyear_l,
      item_type: value.item_type_l,
      condition: value.condition_l,
      netto: value.netto_l,
      invoice: value.invoice_l,
      acoc_rata: value.acoc_rata_l,
      acoc_company: value.acoc_company_l,
      gap_rata: value.gap_rata_l,
      gap_company: value.gap_company_l,
      gap_okres: value.gap_okres_l,
      attentions: value.attentions_l,
      state: value.o_state,
      prov_partner: p_val,
      created_by: req.session.userData.id
    }).save().then(async function(result) {
      // Przypisanie oferty do zapytania ofertowego
      await RequestOffers.setValueById(value.roffer_id, 'offer_id', result.get('id') + '/' + value.offer_type);
      .then(async function() {
        if(result.get('state') < 3) await System.changeProvision(result.get('id'), result.get('offer_type'), true, false);
        else if(result.get('state') == 3) await System.changeProvision(result.get('id'), result.get('offer_type'), true, true);
        else await System.changeProvision(result.get('id'), result.get('offer_type'), false, false);
      });

      for(var i = 0; i <= value.variant.length-1; i++) {
        new LeasingVariants({
          offer_id: result.get('id'),
          wklad: value.variant[i]['inital'],
          wykup: value.variant[i]['repurchase'],
          leasing_install: value.variant[i]['leasing_install'],
          //total_fees: value.variant[i]['sum_fee'],
          okres: value.variant[i]['contract']
        }).save();
      }

      callback('offer_' + result.get('id') + '_L_' + moment().format('YYYY'), result.get('id'));
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
      insurance_cost: value.insurance_cost,
      state: value.o_state,
      prov_partner: p_val,
      created_by: req.session.userData.id
    }).save().then(function(result) {
      // Przypisanie oferty do zapytania ofertowego
      RequestOffers.setValueById(value.roffer_id, 'offer_id', result.get('id') + '/' + value.offer_type)
      .then(function() {
        if(result.get('state') < 3) System.changeProvision(result.get('id'), result.get('offer_type'), true, false);
        else if(result.get('state') == 3) System.changeProvision(result.get('id'), result.get('offer_type'), true, true);
        else System.changeProvision(result.get('id'), result.get('offer_type'), false, false);
      });

      callback('offer_' + result.get('id') + '_I_' + moment().format('YYYY'), result.get('id'));
      Notification.sendNotificationByRole('administrator', 'flaticon2-add-square kt-font-success', 'Pracownik <b>' + req.session.userData.fullname + '</b> dodał ofertę <b>00' + result.get('id') + '/I/' + moment().format('YYYY') + '</b>.');
    });
  } else {
    if(value.acoc_rata.length == 0) value.acoc_rata = null;
    if(value.attentions_r.length == 0) value.attentions_r = null;
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
      wykup: value.wykup_r,
      limit: value.km_limit_r,
      invoice: value.invoice_r,
      reg_number: value.reg_number_r,
      service: value.service_pack,
      tire: value.tire_pack,
      insurance: value.insurance_pack,
      gap: value.insurance_gap,
      acoc_rata: value.acoc_rata,
      acoc_company: value.acoc_company,
      attentions: value.attentions_r,
      state: value.o_state,
      prov_partner: p_val,
      created_by: req.session.userData.id
    }).save().then(async function(result) {
      // Przypisanie oferty do zapytania ofertowego
      await RequestOffers.setValueById(value.roffer_id, 'offer_id', result.get('id') + '/' + value.offer_type);
      .then(async function() {
        if(result.get('state') < 3) await System.changeProvision(result.get('id'), result.get('offer_type'), true, false);
        else if(result.get('state') == 3) await System.changeProvision(result.get('id'), result.get('offer_type'), true, true);
        else await System.changeProvision(result.get('id'), result.get('offer_type'), false, false);
      });

      callback('offer_' + result.get('id') + '_R_' + moment().format('YYYY'), result.get('id'));
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

        if(value.acoc_rata_l) model.set('acoc_rata', value.acoc_rata_l);
        else model.set('acoc_rata', null);
        if(value.acoc_company_l) model.set('acoc_company', value.acoc_company_l);
        else model.set('acoc_company', null);
        if(value.gap_rata_l) model.set('gap_rata', value.gap_rata_l);
        else model.set('gap_rata', null);
        if(value.gap_okres_l) model.set('gap_okres', value.gap_okres_l);
        else model.set('gap_okres', null);
        if(value.gap_company_l) model.set('gap_company', value.gap_company_l);
        else model.set('gap_company', null);
        if(value.attentions_l) model.set('attentions', value.attentions_l);
        else model.set('attentions', null);

        model.save().then(function(result) {
          // Prowizje
          if(result.get('state') < 3) System.changeProvision(result.get('id'), result.get('offer_type'), true, false);
          else if(result.get('state') == 3) System.changeProvision(result.get('id'), result.get('offer_type'), true, true);
          else System.changeProvision(result.get('id'), result.get('offer_type'), false, false);

          value.variant.forEach(function(val) {
            new LeasingVariants().where({ id: val.id }).fetch()
            .then(function(variant) {
              if(variant) {
                if(val.contract) variant.set('okres', val.contract);
                if(val.inital) variant.set('wklad', val.inital);
                if(val.leasing_install) variant.set('leasing_install', val.leasing_install);
                if(val.repurchase) variant.set('wykup', val.repurchase);
                //if(val.sum_fee) variant.set('total_fees', val.sum_fee);

                variant.save();
              }
            });
          });
        });
        callback(Messages.message('offer_data_change', null));

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
        if(value.wykup_r) model.set('wykup', value.wykup_r);
        if(value.km_limit_r) model.set('limit', value.km_limit_r);
        if(value.reg_number_r) model.set('reg_number', value.reg_number_r);
        if(value.service_pack) model.set('service', value.service_pack);
        else model.set('service', null);
        if(value.tire_pack) model.set('tire', value.tire_pack);
        else model.set('tire', null);
        if(value.insurance_pack) model.set('insurance', value.insurance_pack);
        else model.set('insurance', null);
        if(value.insurance_gap) model.set('gap', value.insurance_gap);
        if(value.acoc_rata) model.set('acoc_rata', value.acoc_rata);
        else model.set('acoc_rata', null);
        if(value.acoc_company) model.set('acoc_company', value.acoc_company);
        else model.set('acoc_company', null);
        if(value.invoice_r) model.set('invoice', value.invoice_r);
        if(value.attentions_r) model.set('attentions', value.attentions_r);
        else model.set('attentions', null);

        model.save().then(function(done) {
          if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
          else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
          else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);
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
          if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
          else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
          else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);
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
          if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
          else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
          else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);
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
          if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
          else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
          else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);
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
          if(done.get('state') < 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, false);
          else if(done.get('state') == 3) System.changeProvision(done.get('id'), done.get('offer_type'), true, true);
          else System.changeProvision(done.get('id'), done.get('offer_type'), false, false);
        });

        callback(Messages.message('offer_status_change', null));
      } else callback({ status: 'error', message: 'Oferta dla której próbujesz zmienić status, nie istnieje.' });
    });
  }
}
