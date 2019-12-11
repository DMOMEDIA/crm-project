 const Roles = require('../models/roles');
const User = require('../models/user');
const Client = require('../models/clients');
const ROffer = require('../models/roffers');
const Offer = require('../models/offers');
const Company = require('../models/companies');
const Notification = require('../models/notifications');
const Messages = require('../config/messages.js');
const System = require('../models/system');
const Mails = require('../controllers/Mails');
const moment = require('moment');
const async = require('async');
const upload = require('multer')();
const fs = require('fs');
const Promise = require('bluebird');
const path = require('path');
const sanitize = require('sanitize-filename');

// String truncate
String.prototype.trunc = String.prototype.trunc ||
function(n){
    return (this.length > n) ? this.substr(0, n-1) + '&hellip;' : this;
};
//

exports.permissions = async (req, res) => {
  if(req.isAuthenticated()) {
    await Roles.getPermissionByRole(req.query.role, function(data) {
      res.send(data);
    }).catch(function(err) {
      res.json(Messages.message('data_get_error', null));
    });
  } else res.json(Messages.message('no_authorization', null));
};

exports.permissionsModify = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.role != null) {
      Roles.savePermissions(req.body.role, (req.body.permissions ? req.body.permissions : null), function(callback) {
        res.send(callback);
      });
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.addUser = (req, res) => {
  if(req.isAuthenticated()) {
    var permission = 'crm.employees.add.' + req.body.urole;
    if(!res.locals.userPermissions.includes(permission)) {
      return res.json(Messages.message('save_user_critical_err', null));
    }
    if(req.body.password != req.body.confirm_password) {
      return res.json(Messages.message('save_user_critical_err', null));
    }

    // Zapis do bazy danych
    if(req.body != null) {
      User.createUser({
        identity: req.body.gen_identity,
        password: req.body.password,
        fullname: req.body.firstname + ' ' + req.body.lastname,
        address: req.body.address,
        postcode: req.body.postcode,
        city: req.body.city,
        voivodeship: req.body.voivodeship,
        country: req.body.country,
        email: req.body.email,
        telephone: req.body.pNumber,
        role: req.body.urole,
        isCompany: req.body.isCompany
      });

      res.json(Messages.message('added_new_user', req.body.gen_identity));
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserlist = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.show')) {
      var output = {};
      if(req.body.id) {
        User.userListByAssignedId(null, req.body.id, function(result, nums) {
          output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
          output['data'] = result;
          res.json(output);
        });
      } else {
        if(req.session.userData.role == 'administrator') {
          User.userList(null, function(result, nums) {
            output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
            output['data'] = result;
            res.json(output);
          });
        } else {
          User.userListByAssignedId(null, req.session.userData.id, function(result, nums) {
            output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
            output['data'] = result;
            res.json(output);
          });
        }
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserlistName = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.client.assign_edit')) {
      if(req.session.userData.role == 'administrator') {
        User.userList(['id','fullname','role'], function(result,  nums) {
          res.json(result);
        });
      } else {
        User.userListByAssignedId(['id','fullname','role'], req.session.userData.id, function(result, nums) {
          result.push({ id: req.session.userData.id, fullname: req.session.userData.fullname, role: req.session.userData.role });
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserlistByRole = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.users.assign_edit')) {
      if(req.query.role != null) {
        User.userlistByRole(['id','fullname','role'], req.query.role, function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.getUserById(null, req.body.id).then(function(user) {
          if(user != null) res.json(user);
          else res.json(Messages.message('not_found_user_identity', null));
        });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getUserByIdLimited = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.id != null) {
      User.getUserById(['id','fullname','role'], req.body.id).then(function(user) {
        if(user) res.json(user);
        else res.json(Messages.message('not_found_user_identity', null));
      });
    } else res.json(Messages.message('identity_not_selected', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.modifyUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.userModify(req.body, result => { res.send(result) });
      }
      else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.changeUserPassword = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.edit')) {
      if(req.body.id != null) {
        User.userChangePassword(req.body, result => { res.send(result) });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.deleteUserById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.employees.delete')) {
      if(req.body.id != null) {
        User.deleteUser(req.body.id, result => { res.send(result) });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.deleteSelectedUsers = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.data != null) {
      var deleted = 0;
      async.each(req.body.data, async function(value, cb) {
        await User.deleteUser(value, cb => {
          if(cb.status == 'success') deleted++;
        });
      }, function() {
        if(deleted > 0) res.json(Messages.message('success_delete_selected_users', deleted));
        else res.json(Messages.message('err_selected_users', null));
      });
    }
  } else res.json(Messages.message('no_authorization', null));
}

// == Client page REST

exports.addClient = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.clients.add')) {

      // Zapis do bazy danych
      if(req.body != null) {

          if(req.body.client_type == 0) var clientname = req.body.firstname + ' ' + req.body.lastname;
          else var clientname = req.body.companyName;

          Client.createClient({
            fullname: clientname,
            nip: req.body.nip,
            phone: req.body.phone,
            email: req.body.email,
            company: req.body.client_type,
            company_type: req.body.company_type,
            state: 3,
            user_id: req.body.param
          }).then(function() {
            Notification.sendNotificationToUser(req.body.param, 'flaticon-users-1 kt-font-success', 'Klient <b>' + clientname.trunc(25) + '</b> został przypisany do Twojej obsługi.');
            System.createLog('create_client_log', 'Klient ' + clientname.trunc(25) + ' został utworzony (USER=' + req.session.userData.id + ').');
          });
        }

        res.json(Messages.message('added_new_client', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getClientList = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.clients.show')) {
      var output = {};
      if(req.body.id) {
        Client.clientlistByAssignedId(req.body.id, function(result, nums) {
          output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
          output['data'] = result;
          res.json(output);
        });
      } else {
        if(req.session.userData.role == 'administrator') {
          Client.clientList(function(result, nums) {
            output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
            output['data'] = result;
            res.json(output);
          });
        } else {
          Client.clientlistByAssignedId(req.session.userData.id, function(result, nums) {
            output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
            output['data'] = result;
            res.json(output);
          });
        }
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getClientById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.clients.edit')) {
      if(req.body.id != null) {
        Client.getClientById(req.body.id).then(function(user) {
          if(user != null) res.json(user);
          else res.json(Messages.message('not_found_client_identity', null));
        });
      } else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.modifyClientById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.clients.edit')) {
      if(req.body.id != null) {
        Client.saveClientData(req, result => { res.send(result) });
      }
      else res.json(Messages.message('identity_not_selected', null));
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.changeClientStatus = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body) {
      Client.changeStatus(req.body, function(result) {
        res.json(result);
      });
    }
  } else res.json(Messages.message('no_authorization', null));
};

// { Zapytania ofertowe }
exports.getOfferRequests = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.roffers.show')) {
      var output = {};

      if(req.session.userData.role == 'administrator') {
        ROffer.getClientOffers(function(data, nums) {
          output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
          output['data'] = data;
          res.json(output);
        });
      } else {
        ROffer.getClientOffersAssigned(req.session.userData.id, function(data, nums) {
          if(data != null) {
            output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
            output['data'] = data;
            res.json(output);
          }
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getRequestOfferById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.roffers.show')) {
      if(req.body.id != null) {
        ROffer.getOfferById(req.body.id, function(data) {
          if(data != null) res.json(data);
          else res.json(Messages.message('not_found_roffer', null));
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.addRequestOffer = (req, res) => {
  if(req.body) {
    ROffer.addOffer(req.body, function(result) {
      res.json(result);
    });
  }
};

// Notifications //

exports.getUserNotifications = (req, res) => {
  if(req.isAuthenticated()) {
    var output = {};
    Notification.getUserNotifications(req.session.userData.id, function(data, unread) {
      if(data != null) {
        output = { unread: unread };
        output['notifications'] = data;
        res.json(output);
      } else res.json(Messages.message('no_notification', null));
    });
  } else res.json(Messages.message('no_authorization', null));
};

exports.notificationSetUnread = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.id != null) {
      Notification.setUnreadNotification(req.body.id, function(result) {
        res.json(result);
      });
    } else res.json({ status: 'error' });
  } else res.json(Messages.message('no_authorization', null));
};

// ------------ //

// Oferty //

exports.loadOfferlist = (req, res) => {
  var output = {};
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.show')) {
      Offer.getOffers(req, function(result, nums) {
        output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
        output['data'] = result;
        res.json(result);
      });
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.clientRemoteList = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.session.userData.role == 'administrator') {
      Client.clientList(function(result, nums) {
        res.json(result);
      });
    } else {
      Client.clientlistByAssignedId(req.session.userData.id, function(result, nums) {
        res.json(result);
      });
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.companyRemoteList = (req, res) => {
  if(req.isAuthenticated()) {
    Offer.companyList(function(result) {
      res.json(result);
    });
  } else res.json(Messages.message('no_authorization', null));
};

exports.deleteSelectedOffers = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.delete')) {
      if(req.body.data) {
        var deleted = 0;
        async.each(req.body.data, async function(value, cb) {
          await Offer.deleteOffer(value, cb => {
            if(cb.status == 'success') deleted++;
          });
        }, function() {
          if(deleted > 0) res.json(Messages.message('success_delete_selected_offers', deleted));
          else res.json(Messages.message('err_selected_offers', null));
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
}

exports.getOfferById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.show')) {
      if(req.body.id != null && req.body.type != null) {
        Offer.getOfferById(req.body.id, req.body.type, function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.insertOffer = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.add')) {
      if(req.body != null) {
        Offer.createOffer(req, function(param, id) {
          var params = { offer_path: param, offer_id: id };
          res.json(Messages.message('added_new_offer', params ));
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.updateROfferData = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.roffers.data_change')) {
      if(req.body != null) {
        ROffer.uploadOffer(req.body, function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.changeOfferStatus = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.status_change')) {
      if(req.body != null) {
        Offer.changeStatus(req.body, function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.changeOfferData = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.offers.data_change')) {
      if(req.body != null) {
        Offer.changeData(req.body, function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.sendOfferMail = async (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body.o_state == 2) {
      Offer.getOfferById(req.body.o_id, req.body.offer_type, offer => {
        if(offer) {
          var date_format = moment(offer.created_at).local().format('DD-MM-YYYY');
          var o_identity = '00' + offer.id + '/' + offer.offer_type.charAt(0).toUpperCase() + '/' + moment(offer.created_at).local().format('YYYY');

          try {
            var attachments = [];
            var files = fs.readdirSync('./uploads/offer/' + req.body.o_path);
            async.each(files, function(name, cb) {
              attachments.push({ filename: name, path: './uploads/offer/' + req.body.o_path + '/' + name });
              cb();
            }, function() {
              Mails.sendMail.send({
                template: 'client_offer',
                message: {
                  from: '"CRM System" <oferty@crmsystem.pl>',
                  to: offer.client.email,
                  subject: 'Znaleźliśmy dla Ciebie odpowiednią ofertę.',
                  attachments: attachments
                },
                locals: {
                  data: offer,
                  date_format: date_format,
                  identity: o_identity
                }
              }).then(function() {
                res.json({ status: 'success' });
              });
            });
          }
          catch {
            res.json({ status: 'error', message: 'Wystąpił błąd podczas pobierania załączników, zgłoś problem administratorowi.' });
          }

          /* Mails.sendMail.send({
            template: 'client_offer',
            message: {
              from: '"CRM System" <oferty@crmsystem.pl>',
              to: offer.client.email,
              subject: 'Znaleźliśmy dla Ciebie odpowiednią ofertę.'
            },
            locals: {
              data: offer,
              date_format: date_format,
              identity: o_identity
            },
            attachments: {

            }
          }).then(function() {
            res.json({ status: 'success' });
          }); */
        } else res.json(Messages.message('not_found_offer', null));
      });
    }
  }
  /* if(req.isAuthenticated()) {
    if(req.body.o_state == 2) {
      await Client.getClientById(req.body.client_id).then(async function(user) {
        if(user != null) {
          var company = await Company.getCompanyById(req.body.company_id),
          company = company.toJSON(),
          user = user.toJSON();

          Mails.sendMail.send({
            template: 'client_offer',
            message: {
              from: '"CRM System" <oferty@crmsystem.pl>',
              to: user.email,
              subject: 'Znaleźliśmy dla Ciebie odpowiednią ofertę.'
            },
            locals: {
              data: req.body,
              user: user,
              company: company
            }
          }).then(function() {
            res.json({ status: 'success' });
          });
        }
        else res.json(Messages.message('not_found_client_identity', null));
      });
    }
  } else res.json(Messages.message('no_authorization', null)); */
};

exports.uploadOfferFiles = (req, res, next) => {
  if(req.isAuthenticated()) {
    if(req.files) {
      var upload_dir = 'uploads',
      offer_dir = 'offer',
      f_path = req.body.folder_path;

      fs.mkdirSync(upload_dir + '/' + offer_dir + '/' + f_path, { recursive: true });

      Promise.resolve(req.files)
        .each(function(file_incoming, idx) {
          var sanitized_filename = sanitize(file_incoming.originalname);
          var file = path.join(upload_dir, offer_dir, f_path, sanitized_filename);

          return fs.writeFileSync(file, file_incoming.buffer);
        }).then(function() {
          res.status(200).json(Messages.message('added_new_offer', null));
        });
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.uploadClientFiles = (req, res, next) => {
  if(req.isAuthenticated()) {
    if(req.files) {
      var upload_dir = 'uploads',
      client_dir = 'clients',
      f_path = req.body.folder_path;

      fs.mkdirSync(upload_dir + '/' + client_dir + '/' + f_path, { recursive: true });

      Promise.resolve(req.files)
        .each(function(file_incoming, idx) {
          var sanitized_filename = sanitize(file_incoming.originalname);
          var file = path.join(upload_dir, client_dir, f_path, sanitized_filename);

          return fs.writeFileSync(file, file_incoming.buffer);
        }).then(function() {
          res.status(200).json(Messages.message('added_new_files', null));
        });
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.uploadRequestOfferFiles = (req, res, next) => {
  if(req.isAuthenticated()) {
    if(req.session.userData.role == 'administrator') {
      if(req.files) {
        var upload_dir = 'uploads',
        client_dir = 'roffers',
        f_path = req.body.folder_path;

        fs.mkdirSync(upload_dir + '/' + client_dir + '/' + f_path, { recursive: true });

        Promise.resolve(req.files)
          .each(function(file_incoming, idx) {
            var sanitized_filename = sanitize(file_incoming.originalname);
            var file = path.join(upload_dir, client_dir, f_path, sanitized_filename);

            return fs.writeFileSync(file, file_incoming.buffer);
          }).then(function() {
            res.status(200).json(Messages.message('added_new_files', null));
          });
      }
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.getFiles = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body) {
      try {
        var output = fs.readdirSync('./uploads/' + req.body.folder_path);
        res.json({ files: output });
      }
      catch {
        res.json({ error: 'Directory not found' });
      }
    }
  } else res.json(Messages.message('no_authorization', null));
};

exports.downloadFile = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body) {
      var file = './uploads/' + req.body.path;
      res.download(file);
    }
  } else res.json(Messages.message('no_authorization', null));
};

/** ================================================
    @Information Moduł usuwający określony plik.
 =============================================== **/

exports.deleteFile = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body) {
      try {
        var file = './uploads/' + req.body.path;
        fs.unlinkSync(file);
        res.json(Messages.message('file_deleted_success', null));
      }
      catch {
        res.json(Messages.message('file_deleted_fail', null));
      }
    }
  } else res.json(Messages.message('no_authorization', null));
};

/** ================================================
    @Information Moduł zmieniający weryfikację pliku (zapytania ofertowe)
 =============================================== **/

exports.changeFileVerify = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.body) {
      var file_path = req.body.path.split('/'),
      filename = file_path[2],
      folder = path.join('uploads', file_path[0], file_path[1]),
      old_path = path.join(folder, filename);

      if(filename.indexOf('-verified') !== -1) {
        var n_filename = filename.replace('-verified', ''),
        n_path = path.join(folder, n_filename);

        try {
          fs.renameSync(old_path, n_path);
          res.json({ status: 'success', verified: false, fname: n_filename });
        }
        catch {
          res.json(Messages.message('error_global', null));
        }
      } else {
        var split_name = filename.split('.');
        var n_filename = split_name[0] + '-verified.' + split_name[1],
        n_path = path.join(folder, n_filename);

        try {
          fs.renameSync(old_path, n_path);
          res.json({ status: 'success', verified: true, fname: n_filename });
        }
        catch {
          res.json(Messages.message('error_global', null));
        }
      }
    }
  } else res.json(Messages.message('no_authorization', null));
};

// Firmy

exports.requestOfferSendMail = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.session.userData.role == 'administrator') {
      if(req.body != null) {
        ROffer.setValueById(req.body.data.id, 'state', 2);
        Mails.sendMail.send({
          message: {
            from: '"CRM System" <oferty@crmsystem.pl>',
            to: req.body.mails.toString(),
            subject: 'Zapytanie ofertowe (ID: 00' + req.body.data.id + '/' + moment(req.body.data.created_at).local().format('YYYY') + ')',
            html: 'Wiadomość z zapytaniem ofertowym, zawartość w załączniku'
          }
        }).then(function() {
          res.json(Messages.message('success_send_mail_to_company', null));
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.requestOfferDone = (req, res) => {
  if(req.isAuthenticated()) {
    if(req.session.userData.role == 'administrator') {
      if(req.body.state == 2) {
        ROffer.setValueById(req.body.id, 'state', 3);
        console.log(req.body.client_info.id);
        Notification.sendNotificationToUser(req.body.client_info.user_id, 'flaticon-questions-circular-button kt-font-brand', 'Zapytanie ofertowe <b>00' + req.body.id + '/' + moment(req.body.created_at).local().format('YYYY') + '</b> zostało zrealizowane przez administratora <b>' + req.session.userData.fullname + '</b>.')
        .then(function(done) {
          res.json({ status: 'success', message: 'Zapytanie zostało zrealizowane pomyślnie.' });
        });
      } else res.json({ status: 'error', message: 'Zapytanie ofertowe musi zostać wysłane do odpowiednich firm przed jego realizacją.' });
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.loadCompanylist = (req, res) => {
  var output = {};
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.companies.show')) {
      Company.getCompanyList(function(result, nums) {
        output['meta'] = { page: 1, pages: 1, perpage: 10, total: nums, sort: 'desc', field: 'id' };
        output['data'] = result;
        res.json(result);
      });
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.addCompany = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.companies.add')) {
      if(req.body != null) {
        Company.addNewCompany(req.body, result => { res.json(result) });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getCompanyById = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.companies.show')) {
      if(req.body.id) {
        Company.getCompanyById(req.body.id).then(function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.editCompany = (req, res) => {
  if(req.isAuthenticated()) {
    if(res.locals.userPermissions.includes('crm.companies.edit')) {
      if(req.body) {
        Company.changeData(req.body, function(result) {
          res.json(result);
        });
      }
    } else res.json(Messages.message('no_permission', null));
  } else res.json(Messages.message('no_authorization', null));
};

exports.getCompanyProvision = (req, res) => {
  Company.getCompanyProvision(req.body.id).then(function(result) {
    res.json(result);
  });
};

// stats

exports.getOfferCount = (req, res) => {
  if(req.isAuthenticated()) {
    Offer.getOfferCounts(function(cb) {
      res.json(cb);
    });
  }
};

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
