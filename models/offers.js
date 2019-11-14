const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages');

const Client = bookshelf.Model.extend({
  tableName: 'crm_clients',
  hasTimestamps: true,

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

module.exports.getOffers = (callback) => {
  var output = [];
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

module.exports.companyList = (callback) => {
  return new Company().fetchAll().then(function(result) {
    callback(result);
  });
}
