/** ================================================


    @File Analityka i statytyka danych systemowych (plik obsługujący).


 =============================================== **/

const Offer = require('../models/offers');
const System = require('../models/system');
const User = require('../models/user');
const Messages = require('../config/messages');


/** ================================================
    @Information Pobieranie listy użytkowników z prowizjami.
 =============================================== **/
exports.getUserlistProv = (req, res) => {
  if(req.isAuthenticated()) {
    var output = {};
    User.getUserListProvision(req, req.body.dateFrom, function(result, nums) {
      output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
      output['data'] = result;
      res.json(output);
    });
  } else res.json(Messages.message('no_authorization', null));
}

/** ================================================
    @Information Pobieranie sumy prowizji zdobytych/utraconych/prognozowanych.
 =============================================== **/
exports.getUserProvision = (req, res) => {
  if(req.isAuthenticated()) {
    User.getUserProvision(req.session.userData.id, '2019-01-01 00:00:00', result => {
      res.json(result);
    });
  } else res.json(Messages.message('no_authorization', null));
}


/** ================================================
    @Information Pobieranie liczby wszystkich ofert.
 =============================================== **/
exports.getOfferCount = (req, res) => {
  if(req.isAuthenticated()) {
    Offer.getOfferCounts(function(cb) {
      res.json(cb);
    });
  }
};

/** ================================================
    @Information Pobieranie statystyk prowizji z określonej liczby dni wstecz.
 =============================================== **/
exports.getProvisionStats = (req, res) => {
  if(req.isAuthenticated()) {
    System.provisionStatistics(7, true, function(values, today_prov) {
      res.json({ values: values, today_prov: today_prov });
    });
  }
};

exports.getStatsCount = (req, res) => {
  if(req.isAuthenticated()) {
    System.getStatsCounts(function(user_cnt, roffer_cnt) {
      res.json({ client_count: user_cnt, roffer_count: roffer_cnt });
    });
  }
};
