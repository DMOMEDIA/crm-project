const CronJob = require('cron').CronJob;
const System = require('../models/system');

exports.ScheduleEveryDay = () => {
  new CronJob('0 0 * * *', function() {
    System.archiveStats('provision_global');
    System.archiveStats('provision_forecast');
  }, null, true, 'Europe/Warsaw');
};
