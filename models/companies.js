const bookshelf = require('../config/bookshelf');
const async = require('async');
const Messages = require('../config/messages');

const Company = bookshelf.Model.extend({
  tableName: 'crm_companies',
  hasTimestamps: true
});

const CompanySent = bookshelf.Model.extend({
  tableName: 'crm_roffers_history',
  hasTimestamps: true
});

module.exports.getCompanyList = (callback) => {
  return new Company().fetchAll()
  .then(function(result) {
    callback(result, result.toJSON().length);
  });
};

module.exports.addNewCompany = (value, callback) => {
  return new Company({
    fullname: value.companyName,
    nip: value.nip,
    address: value.address,
    postcode: value.postcode,
    city: value.city,
    voivodeship: value.voivodeship,
    email: value.email,
    phone: value.phone,
    firstname_k: value.firstname_k,
    lastname_k: value.lastname_k,
    email_k: value.email_k,
    phone_k: value.phone_k,
    provision_leasing: value.provision_leasing,
    provision_rent: value.provision_rent
  }).save().then(function() {
    callback(Messages.message('company_added', null));
  });
};

module.exports.getCompanyById = (id) => {
  return new Company().where({ id: id }).fetch();
};

module.exports.getCompanyByEmail = (email) => {
  return new Company().where({ email: email }).fetch();
};

module.exports.deleteCompany = (id, callback) => {
  return new Company().where({ id: id }).fetch({ require: true }).then(function(model) {
    if(model) {
      callback(Messages.message('success_company_deleted', null));
      return model.destroy();
    } else callback(Messages.message('not_found_company_identity', null));
  });
};

module.exports.getCompanyProvision = (id) => {
  return new Company().where({ id: id }).fetch({ columns: ['provision_leasing', 'provision_rent'] });
}

module.exports.changeData = (value, callback) => {
  return new Company().where({ id: value.id }).fetch()
  .then(function(model) {
    if(model) {
      if(value.fullname) model.set('fullname', value.fullname);
      if(value.nip) model.set('nip', value.nip);
      if(value.email) model.set('email', value.email);
      if(value.phone) model.set('phone', value.phone);
      if(value.address) model.set('address', value.address);
      if(value.postcode) model.set('postcode', value.postcode);
      if(value.city) model.set('city', value.city);
      if(value.voivodeship) model.set('voivodeship', value.voivodeship);
      if(value.firstname_k) model.set('firstname_k', value.firstname_k);
      if(value.lastname_k) model.set('lastname_k', value.lastname_k);
      if(value.email_k) model.set('email_k', value.email_k);
      if(value.phone_k) model.set('phone_k', value.phone_k);
      if(value.provision_leasing) model.set('provision_leasing', value.provision_leasing);
      if(value.provision_rent) model.set('provision_rent', value.provision_rent);

      model.save().then(function(done) {
        callback(Messages.message('success_company_data_change', null));
      });
    }
  });
};

module.exports.getCompanySent = (rid, callback) => {
  var output = [];
  return new CompanySent().where({ roffer_id: rid }).fetchAll()
  .then(function(result) {
    result = result.toJSON();
    async.each(result, async function(e, cb) {
      await module.exports.getCompanyById(e.company_id)
      .then(function(done) {
        if(done) output.push(done.get('fullname'));
      });
      cb();
    }, function() {
      callback(output);
    });
  });
};

module.exports.insertCompanySent = (roffer_id, email) => {
  module.exports.getCompanyByEmail(email).then(function(result) {
    return new CompanySent().where({ company_id: result.get('id'), roffer_id: roffer_id }).fetch()
    .then(function(model) {
      if(!model) {
        return new CompanySent({
          company_id: result.get('id'),
          roffer_id: roffer_id
        }).save();
      }
    });
  });
};
