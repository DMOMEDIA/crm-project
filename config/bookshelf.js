const knex = require('knex')(require('./knexfile'));
const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(require('bookshelf-eloquent'));

module.exports = bookshelf;
