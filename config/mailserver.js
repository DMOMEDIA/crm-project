const fs = require('fs');

module.exports = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  },
  dcim: {
    domainName: 'wsparciedlabiznesu.eu',
    keySelector: 'default',
    privateKey: fs.readFileSync('./config/certs/private.pem'),
    cacheDir: "/tmp",
    cacheTreshold: 100 * 1024
  },
  transport: {
    jsonTransport: true
  }
};
