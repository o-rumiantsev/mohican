'use strict';


const MySQLProvider = function() {
  this.connection = null;
};

module.exports = MySQLProvider;

const { URL } = require('url');
const mysql = require('mysql');
const tools = require('common-toolkit');
const mixinErrors = require('./errors.js');
const queries = require('./mysql.queries.js');

const MySQLCursor = require('./mysql.cursor.js');

mixinErrors(MySQLProvider);

MySQLProvider.prototype.connect = function(url, callback) {
  const { host, username, password } = new URL(url);

  try {
    const connection = mysql.createConnection({
      host,
      user: username,
      password
    });

    this.connection = connection;
    callback(null);
  } catch (error) {
    callback(error);
  }
};

MySQLProvider.prototype.open = function(name, callback) {
  const create = (data, cb) => this.connection
    .query(queries.createDatabaseIfNotExists(name), cb);

  const use = (data, cb) => this.connection
    .query(queries.use(name), cb);

  tools.async.sequential([create, use], callback);
};

MySQLProvider.prototype.select = function(query) {
  if (!query.category) {
    throw new Error(this.errors.ERR_CATEGORY_REQUIRED);
  }

  const cursor = new MySQLCursor(query);
  return cursor;
};
