const bookshelf = require('../config/bookshelf');
const async = require('async');
const moment = require('moment');
const Company = require('../models/companies');

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


/** ================================================
    @Information Moduł zmiany prowizji dla określonej oferty.
 =============================================== **/

module.exports.changeProvision = (user, offer_id, offer_type, value, company_id, forecast, cancel) => {

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
};
