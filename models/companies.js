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
