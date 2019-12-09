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
