const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Messages = require('../config/messages');

const Notification = bookshelf.Model.extend({
  tableName: 'crm_notifications',
  hasTimestamps: true
});

const User = bookshelf.Model.extend({
  tableName: 'crm_users',
  hasTimestamps: true
});

module.exports.getUserNotifications = (id, callback) => {
  return new Notification().where({ user_id: id }).orderBy('created_at', 'DESC').fetchAll().then(function(result) {
    if(result) {
      Notification.where({ user_id: id, read: 1 }).count().then(function(unread) {
        callback(result, unread);
      });
    } else {
      callback(null, 0);
    }
  });
};

module.exports.setUnreadNotification = (id, callback) => {
  return new Notification().where({ id: id }).fetch().then(function(model) {
    if(model) {
      if(model.get('read') == 1) {
        model.set('read', 0);
        model.save();
        callback({ status: 'success' });
      } else callback({ status: 'error' });
    } else callback({ status: 'error' });
  });
};

module.exports.sendNotificationToUser = (id, icon, notification) => {
  return new Notification({
    user_id: id,
    icon_color: icon,
    notification: notification
  }).save();
};

module.exports.sendNotificationByRole = (role, icon, notification) => {
  return new User().where({ role: role }).fetchAll()
  .then(function(result) {
    data_json = result.toJSON();

    data_json.forEach(function(item) {
      new Notification({
        user_id: item.id,
        icon_color: icon,
        notification: notification
      }).save();
    });
  });
};
