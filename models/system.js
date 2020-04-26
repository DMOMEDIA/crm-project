const bookshelf = require('../config/bookshelf');
const async = require('async');
const moment = require('moment');
const Company = require('../models/companies');
const Offers = require('../models/offers');
const RequestOffers = require('../models/roffers');
const User = require('../models/user');

const Statistics = bookshelf.Model.extend({
  tableName: 'crm_global_statistics',
  hasTimestamps: true
});

const Archive = bookshelf.Model.extend({
  tableName: 'crm_statistics_archive'
});

const Log = bookshelf.Model.extend({
  tableName: 'crm_logs',
  hasTimestamps: true
});

const Provision = bookshelf.Model.extend({
  tableName: 'crm_provisions',
  hasTimestamps: true
});

const Client = bookshelf.Model.extend({
  tableName: 'crm_clients',
  hasTimestamps: true
});

const ROffer = bookshelf.Model.extend({
  tableName: 'crm_offer_requests',
  hasTimestamps: true
})

module.exports.createLog = (type, log) => {
  return new Log({
    type: type,
    log: log
  }).save();
};

module.exports.provisionStatistics = (days, forecast, callback) => {
  if(forecast) var query = { name: 'provision_forecast' };
  else var query = { name: 'provision_global' };
  return new Archive().where(query).query(function(qb) {
    qb.orderBy('created_at','DESC').limit(days);
  })
  .fetchAll().then(function(result) {
    module.exports.getGlobalProvision(false, 'today', function(prov) {
      callback(result, prov.prov_forecast);
    });
  });
};

module.exports.getOfferProvision = (offer_id, user_id, callback) => {
  return new Provision().where({ user_id: user_id, offer_id: offer_id }).fetch()
  .then(function(result) {
    if(result) callback(result.get('value'));
    else callback(null);
  });
};

/** ================================================
    @Information Pobieranie prowizji globalnej/posrednika
    / Usage: getGlobalProvision(anulowana/nieanulowana, today/lastday/all, dane zwrotne);
 =============================================== **/

module.exports.getGlobalProvision = (isCanceled, fromDay, callback) => {
  if(fromDay == 'today') {
    var query = { canceled: isCanceled, for: 'global', updated_at: moment().local().format('YYYY-MM-DD') };
  } else if(fromDay == 'lastday') {
    var query = { canceled: isCanceled, for: 'global', updated_at: moment().subtract(1, 'days').local().format('YYYY-MM-DD') };
  }
  else var query = { canceled: isCanceled, for: 'global' };

  return new Provision().where(query).fetchAll()
  .then(function(result) {
    if(result) {
      var data = result.toJSON(),
      provision_f = parseFloat(0),
      provision = parseFloat(0);
      async.each(data, function(element, cb) {
        if(element.forecast == true) {
          provision_f += parseFloat(element.value);
        } else {
          provision += parseFloat(element.value);
        }
        cb();
      }, function() {
        callback({ prov_forecast: provision_f, prov_normal: provision });
      });
    } else callback({ prov_forecast: 0, prov_normal: 0 });
  });
};

module.exports.archiveStats = (name) => {
  module.exports.getGlobalProvision(false, 'lastday', function(result) {
    if(name == 'provision_global') {
      return new Archive({
        name: name,
        value: result.prov_normal
      }).save().then(function(res) {
        return module.exports.createLog('statistics_every_day_log', 'Zapis statystyk został wykonany poprawnie (NAME=' + name + ').');
      }).catch(function(err) {
        return module.exports.createLog('statistics_every_day_log', 'Błąd podczas zapisu danych statystycznych (NAME=' + name + ').');
      });
    } else {
      return new Archive({
        name: name,
        value: result.prov_forecast
      }).save().then(function(res) {
        return module.exports.createLog('statistics_every_day_log', 'Zapis statystyk został wykonany poprawnie (NAME=' + name + ').');
      }).catch(function(err) {
        return module.exports.createLog('statistics_every_day_log', 'Błąd podczas zapisu danych statystycznych (NAME=' + name + ').');
      });
    }
  });
};

/** ================================================
    @Information Pobieranie liczby klientów oraz zrealizowanych zapytań ofertowych.
 =============================================== **/

module.exports.getStatsCounts = (callback) => {
  return new Client().count().then(function(client_cnt) {
    return new ROffer().where({ state: 3 }).count().then(function(roffer_cnt) {
      callback(client_cnt, roffer_cnt);
    });
  });
};

module.exports.calculateProvisionFromOffer = (offer_id, otype, callback) => {

  Offers.getOfferById(offer_id, otype, function(result) {
    Company.getCompanyProvision(result.company_id).then(function(prov) {
      prov = prov.toJSON();

      if(otype == 'leasing') var provision = (parseFloat(result.netto)*(prov.provision_leasing/100));
      else if(otype == 'rent') var provision = (parseFloat(result.netto)*(prov.provision_rent/100));
      else provision = parseFloat(result.insurance_cost);

      new ROffer().where({ offer_id: offer_id + '/' + otype }).fetch()
      .then(function(e) {
        if(e) {
          e = e.toJSON();

          if(e.percentage_partner) {
            var i_prov = parseFloat(0),
            pg_partner = e.percentage_partner.split(' ')[0];

            if(e.percentage_gap) {
              var pg = e.percentage_gap.split(' ')[0];
              i_prov += (parseFloat(result.gap_rata)*(pg/100));
            }
            if(e.percentage_acoc) {
              var pg = e.percentage_acoc.split(' ')[0];
              i_prov += (parseFloat(result.acoc_rata)*(pg/100));
            }

            provision = Math.round((provision*(pg_partner/100))*100)/100;
            provision = provision + i_prov;

            if(result.created_by != 0) {
              User.getUserPartner(result.created_by, cb => {
                callback({
                  provision: provision,
                  percentage: pg_partner,
                  message: cb.message,
                  creator_role: cb.role,
                  partner_id: cb.partner,
                  agent_id: cb.agent,
                  creator_id: result.created_by,
                  prov_partner: result.prov_partner,
                  prov_agent: result.prov_agent,
                  prov_employee: result.prov_employee
                });
              });
            } else callback({
              provision: provision,
              percentage: pg_partner,
              prov_partner: result.prov_partner,
              prov_agent: result.prov_agent,
              prov_employee: result.prov_employee
            });
          } else {
            var i_prov = parseFloat(0);

            if(e.percentage_gap) {
              var pg = e.percentage_gap.split(' ')[0];
              i_prov += (parseFloat(result.gap_rata)*(pg/100));
            }
            if(e.percentage_acoc) {
              var pg = e.percentage_acoc.split(' ')[0];
              i_prov += (parseFloat(result.acoc_rata)*(pg/100));
            }

            provision = provision + i_prov;

            callback({
              provision: provision,
              percentage: 100,
              message: 'provision_for_crm',
              creator_id: result.created_by,
              partner_id: null,
              prov_partner: null,
              prov_agent: null,
              prov_employee: null
            });
          }
        } else callback({ provision: null, percentage: null });
      });
    });
  });
};

/** ================================================
    @Information Moduł zmiany prowizji dla określonej oferty.
 =============================================== **/

module.exports.changeProvision = (offer_id, offer_type, forecast, cancel) => {
  // Kalkulacja procentu z firm oraz ubezpieczeń.
  module.exports.calculateProvisionFromOffer(offer_id, offer_type, function(result) {
    var cdata = result, p_partner = 0, p_agent = 0, p_employee = 0, p_crm = 0;

    if(cdata.prov_partner) p_partner = parseFloat(cdata.prov_partner.split(' ')[0]);
    if(cdata.prov_agent) p_agent = parseFloat(cdata.prov_agent.split(' ')[0]);
    if(cdata.prov_employee) p_employee = parseFloat(cdata.prov_employee.split(' ')[0]);

    var goNext = false;

    if(cdata.message == 'partner_and_agent_found') {
      var sum = p_partner + p_agent + p_employee;
      if(sum == 100) goNext = true;
    } else if(cdata.message == 'user_is_partner') {
      if(p_partner == 100) goNext = true;
    } else if(cdata.message == 'user_has_partner' && cdata.role == 'posrednik') {
      var sum = p_partner + p_agent;
      if(sum == 100) goNext = true;
    } else if(cdata.message == 'provision_for_crm') {
      p_crm = 100;
      goNext = true;
    } else {
      var sum = p_partner + p_employee;
      if(sum == 100) goNext = true;
    }

    if(goNext == true) {
      if(p_partner > 0) {
        var provision_partner = Math.round((cdata.provision*(p_partner/100))*100)/100;

        new Provision().where({ for: 'partner', offer_id: offer_id + '/' + offer_type }).fetch()
        .then(function(model) {
          if(model) {
            model.set('canceled', cancel);
            model.set('forecast', forecast);
            model.set('value', provision_partner);
            if(cdata.partner_id) model.set('user_id', cdata.partner_id);

            model.save();
          } else {
            new Provision({
              canceled: cancel,
              for: 'partner',
              value: provision_partner,
              user_id: cdata.partner_id,
              offer_id: offer_id + '/' + offer_type,
              forecast: forecast
            }).save();
          }
        });
      }

      if(p_agent > 0) {
        var provision_agent = Math.round((cdata.provision*(p_agent/100))*100)/100;

        new Provision().where({ for: 'agent', offer_id: offer_id + '/' + offer_type }).fetch()
        .then(function(model) {
          if(model) {
            model.set('canceled', cancel);
            model.set('forecast', forecast);
            model.set('value', provision_agent);
            if(cdata.agent_id) model.set('user_id', cdata.agent_id);

            model.save();
          } else {
            new Provision({
              canceled: cancel,
              for: 'agent',
              value: provision_agent,
              user_id: cdata.agent_id,
              offer_id: offer_id + '/' + offer_type,
              forecast: forecast
            }).save();
          }
        });
      }

      if(p_employee > 0) {
        var provision_employee = Math.round((cdata.provision*(p_employee/100))*100)/100;

        new Provision().where({ for: 'employee', offer_id: offer_id + '/' + offer_type }).fetch()
        .then(function(model) {
          if(model) {
            model.set('canceled', cancel);
            model.set('forecast', forecast);
            model.set('value', provision_employee);
            if(cdata.creator_id) model.set('user_id', cdata.creator_id);

            model.save();
          } else {
            new Provision({
              canceled: cancel,
              for: 'employee',
              value: provision_employee,
              user_id: cdata.creator_id,
              offer_id: offer_id + '/' + offer_type,
              forecast: forecast
            }).save();
          }
        });
      }

      if(p_crm > 0) {
        new Provision().where({ for: 'global', offer_id: offer_id + '/' + offer_type }).fetch()
        .then(function(model) {
          if(model) {
            model.set('canceled', cancel);
            model.set('forecast', forecast);
            model.set('value', cdata.provision);
            model.set('sell', 1);
            if(cdata.creator_id) model.set('user_id', cdata.creator_id);

            model.save();
          } else {
            new Provision({
              canceled: cancel,
              for: 'global',
              value: cdata.provision,
              user_id: cdata.creator_id,
              sell: 1,
              offer_id: offer_id + '/' + offer_type,
              forecast: forecast
            }).save();
          }
        });
      }
    } else callback({ status: 'error', message: 'Suma prowizji musi osiągać 100% wartości' });
  });
};

/* module.exports.changeProvision = (user, offer_id, offer_type, value, company_id, forecast, cancel) => {

  Company.getCompanyProvision(company_id).then(function(prov) {
    prov = prov.toJSON();

    // Ustalenie globalnej prowizji
    if(offer_type == 'leasing') var provision = (parseFloat(value)*(prov.provision_leasing/100));
    else if(offer_type == 'rent') var provision = (parseFloat(value)*(prov.provision_rent/100));

    provision = Math.round((provision - (provision*0.23))*100)/100; // opodatkowanie 23%

    if(offer_type == 'leasing' || offer_type == 'rent') {
      var p_posrednik = Math.round((provision*0.45)*100)/100, // 45% dla pośrednika
      p_szef = Math.round((provision*0.05)*100)/100, // 5% dla szefa
      p_spolka = Math.round((provision*0.5)*100)/100; // 50% dla spółki
    } else {
  		var p_posrednik = Math.round((parseFloat(value)*0.06)*100)/100, // 6% dla pośrednika
      p_szef = Math.round((parseFloat(value)*0.01)*100)/100, // 1% dla szefa
      p_spolka = Math.round((parseFloat(value)*0.05)*100)/100; // 5% dla spółki
    }

    new Provision().where({ for: 'posrednik', offer_id: offer_id + '/' + offer_type }).fetch()
    .then(function(model) {
      if(model) {
        model.set('canceled', cancel);
        model.set('forecast', forecast);
        model.set('value', p_posrednik);
        if(user.user_id) model.set('user_id', user.user_id);

        model.save();
      } else {
        new Provision({
          canceled: cancel,
          for: 'posrednik',
          value: p_posrednik,
          user_id: user.user_id,
          offer_id: offer_id + '/' + offer_type,
          forecast: forecast
        }).save();
      }
    });

    new Provision().where({ for: 'szef', offer_id: offer_id + '/' + offer_type }).fetch()
    .then(function(model) {
      if(model) {
        model.set('canceled', cancel);
        model.set('forecast', forecast);
        model.set('value', p_szef);
        if(user.assigned_to) model.set('user_id', user.assigned_to);

        model.save();
      } else {
        if(user.assigned_to != null) {
          new Provision({
            canceled: cancel,
            for: 'szef',
            value: p_szef,
            user_id: user.assigned_to,
            offer_id: offer_id + '/' + offer_type,
            forecast: forecast
          }).save();
        }
      }
    });

    new Provision().where({ for: 'global', offer_id: offer_id + '/' + offer_type }).fetch()
    .then(function(model) {
      if(model) {
        model.set('canceled', cancel);
        model.set('forecast', forecast);
        model.set('value', p_spolka);

        model.save();
      } else {
        new Provision({
          canceled: cancel,
          for: 'global',
          value: p_spolka,
          offer_id: offer_id + '/' + offer_type,
          forecast: forecast
        }).save();
      }
    });
  });
}; */
