const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages');

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

module.exports.getOfferById = (id,callback) => {
  return new ROffer()
    .where({ id: id })
    .fetch({ withRelated: ['client_info'] })
    .then(function(data) {
      callback(data);
    });
};
