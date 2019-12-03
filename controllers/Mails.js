const nodemailer = require('nodemailer');
const mail_config = require('../config/mailserver');
const Email = require('email-templates');
const path = require('path');

exports.sendMail = new Email({
  template: './emails',
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: path.resolve('build'),
      images: true
    }
  },
  send: true,
  transport: mail_config,
  preview: false
});
