const bookshelf = require('../config/bookshelf');

const Roles = bookshelf.Model.extend({
  tableName: 'crm_roles',
  idAttribute: 'id'
});

module.exports.getPermissionByRole = function(role, callback) {
  return new Roles().where({ role: role }).fetch({
    require: true
  }).then(function(result) {
    perms = result.get('permissions');
    if(perms) callback(perms.split(','));
    else callback(['null']);
  });
};

module.exports.savePermissions = function(role, array, callback) {
  return new Roles().where({ role: role }).fetch({
    require: true
  }).then(function(model) {
    if(model) {
      if(array) model.set('permissions', array.toString());
      else model.set('permissions', null);
      model.save();
      callback({ status: 'success', message: 'Uprawnienia zostały poprawnie zapisane.' });
    } else {
      callback({ status: 'error', message: 'Rola nie istnieje, uprawnienia nie zostały zapisane.' });
    }
  });
};
