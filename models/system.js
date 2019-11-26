const bookshelf = require('../config/bookshelf');
const async = require('async');

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

module.exports.createLog = (type, log) => {
  return new Log({
    type: type,
    log: log
  }).save();
};

module.exports.archiveStats = (name) => {
  module.exports.getGlobalProvision(function(result) {
    if(name == 'provision_global') {
      return new Archive({
        name: name,
        value: result.provision
      }).save().then(function(res) {
        return module.exports.createLog('statistics_every_day_log', 'Zapis statystyk został wykonany poprawnie (NAME=' + name + ').');
      }).catch(function(err) {
        return module.exports.createLog('statistics_every_day_log', 'Błąd podczas zapisu danych statystycznych (NAME=' + name + ').');
      });
    } else {
      return new Archive({
        name: name,
        value: result.provision_f
      }).save().then(function(res) {
        return module.exports.createLog('statistics_every_day_log', 'Zapis statystyk został wykonany poprawnie (NAME=' + name + ').');
      }).catch(function(err) {
        return module.exports.createLog('statistics_every_day_log', 'Błąd podczas zapisu danych statystycznych (NAME=' + name + ').');
      });
    }
  });
};

module.exports.getGlobalProvision = (callback) => {
  return new Provision().where({ for: 'global' }).fetchAll()
  .then(function(result) {
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
  });
};

/** ================================================
    @Information Moduł zmiany prowizji dla określonej oferty.
 =============================================== **/

module.exports.changeProvision = (user, offer_id, offer_type, value, isUpdate, forecast) => {

  var provision = (parseFloat(value)*0.015); // globalna prowizja 1.5%
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
      model.set('forecast', forecast);
      model.set('value', p_posrednik);
      if(user.user_id) model.set('user_id', user.user_id);

      model.save();
    } else {
      new Provision({
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
      model.set('forecast', forecast);
      model.set('value', p_szef);
      if(user.assigned_to) model.set('user_id', user.assigned_to);

      model.save();
    } else {
      if(user.assigned_to != null) {
        new Provision({
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
      model.set('forecast', forecast);
      model.set('value', p_spolka);

      model.save();
    } else {
      new Provision({
        for: 'global',
        value: p_spolka,
        offer_id: offer_id + '/' + offer_type,
        forecast: forecast
      }).save();
    }
  });
};
