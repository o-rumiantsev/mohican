'use strict';

// Mohican provider for MySQL DBMS
const MySQLProvider = function() {
  this.connection = null;
};

module.exports = MySQLProvider;

const { URL } = require('url');
const mysql = require('mysql');
const tools = require('common-toolkit');
const queries = require('./mysql.queries.js');
const MySQLCursor = require('./mysql.cursor.js');

MySQLProvider.prototype.errors = require('./errors.js');

MySQLProvider.prototype.connect = function(
  // Connect to existng database
  url, // URL string, database url
  callback // function, call after connect
) {
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

MySQLProvider.prototype.open = function(
  // Open database
  name, // string, name of database to open
  callback // function, err, db => {...}
) {
  const create = (data, cb) => this.connection
    .query(queries.createDatabaseIfNotExists(name), cb);

  const use = (data, cb) => this.connection
    .query(queries.use(name), cb);

  tools.async.sequential([create, use], callback);
};

MySQLProvider.prototype.close = function() {
  // Close current conection
  this.connection.end();
};

MySQLProvider.prototype.select = function(
  // Create selection cursor
  query // object, selection mask
) {
  if (!query.category) {
    throw new Error(this.errors.ERR_CATEGORY_REQUIRED);
  }

  const cursor = new MySQLCursor(query, this.connection);
  return cursor;
};

MySQLProvider.prototype.create = function(
  // Create entry in existing(!) table
  entry, // object
  callback // function, (err, id)  => {...}
) {
  if (!query.category) {
    const err = new Error(this.errors.ERR_CATEGORY_REQUIRED);
    callback(err);
    return;
  }

  const query = queries.insert(entry);
  this.connection.query(query, (err, createInfo) => {
    if (err) {
      callback(err);
    } else {
      const id = createInfo.insertId;
      callback(null, id);
    }
  });
};

MySQLProvider.prototype.createTable = function(
  // Create SQL table by given scheme
  scheme, // object, columns definition
  callback // function, err => {...}
) {
  if (!query.category) {
    const err = new Error(this.errors.ERR_CATEGORY_REQUIRED);
    callback(err);
    return;
  }

  const query = queries.createTable(scheme);
  this.connection.query(query, err => callback(err));
};

MySQLProvider.prototype.delete = function(
  // Delete entries by given filter
  filter, // object, filter mask
  callback // function, err => {...}
) {
  if (!query.category) {
    const err = new Error(this.errors.ERR_CATEGORY_REQUIRED);
    callback(err);
    return;
  }

  const query = queries.del(filter);
  this.connection.query(query, err => callback(err));
};

MySQLProvider.prototype.update = function(
  // Update existing entry
  entry, // object, { id, category, ... }
  callback // function, err => {...}
) {
  if (!query.category) {
    const err = new Error(this.errors.ERR_CATEGORY_REQUIRED);
    callback(err);
    return;
  }

  if (!query.id) {
    const err = new Error(this.errors.ERR_ID_REQUIRED);
    callback(err);
    return;
  }

  const query = queries.update(entry);
  this.connection.query(query, err => callback(err));
};

MySQLProvider.prototype.drop = function(
  // Drop SQL table
  category, // string, table name
  callback // function, err => {...}
) {
  const query = queries.drop(category);
  this.connection.query(query, err => callback(err));
};
