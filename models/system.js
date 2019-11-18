const bookshelf = require('../config/bookshelf');

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

module.exports.createLog = (type, log) => {
  return new Log({
    type: type,
    log: log
  }).save();
};

module.exports.archiveStats = (name) => {
  return new Statistics().where({ name: name }).fetch()
  .then(function(result) {
    return new Archive({
      name: result.get('name'),
      value: result.get('value')
    }).save().then(function(res) {
      return module.exports.createLog('statistics_every_day_log', 'Zapis statystyk został wykonany poprawnie (NAME=' + res.get('name') + ').');
    }).catch(function(err) {
      return module.exports.createLog('statistics_every_day_log', 'Błąd podczas zapisu danych statystycznych (NAME=' + res.get('name') + ').');
    });
  });
};
