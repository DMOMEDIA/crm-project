const bookshelf = require('../config/bookshelf');
const Messages = require('../config/messages');

const Company = bookshelf.Model.extend({
  tableName: 'crm_companies',
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
    phone: value.phone
  }).save().then(function() {
    callback(Messages.message('company_added', null));
  });
};

module.exports.getCompanyById = (id, callback) => {
  return new Company().where({ id: id }).fetch()
  .then(function(result) {
    callback(result);
  });
};

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

      model.save().then(function(done) {
        callback(Messages.message('success_company_data_change', null));
      });
    }
  });
};
