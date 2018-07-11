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

MySQLProvider.prototype.close = function() {
  this.connection.end();
};

MySQLProvider.prototype.select = function(query) {
  if (!query.category) {
    throw new Error(this.errors.ERR_CATEGORY_REQUIRED);
  }

  const cursor = new MySQLCursor(query, this.connection);
  return cursor;
};

MySQLProvider.prototype.create = function(entry, callback) {
  const create = (data, cb) => this.connection
    .query(queries.createTableIfNotExists(entry), cb);

  const insert = (data, cb) => this.connection
    .query(queries.insert(entry), cb);

  tools.async.sequential(
    [create, insert],
    (err, createInfo) => {
      if (err) {
        callback(err);
      } else {
        const id = createInfo.insertId;
        callback(null, id);
      }
    }
  );
};

MySQLProvider.prototype.createTable = function(scheme, callback) {
  const query = queries.createTable(scheme);
  this.connection.query(query, callback);
};

// use

const sql = new MySQLProvider();

const createTable = (data, callback) => {
  const idOps = ['AUTO_INCREMENT', 'PRIMARY KEY'];
  const table = {
    id: { type: 'INT', options: idOps },
    name: { type: 'VARCHAR(255)' },
    born: { type: 'DATETIME' },
    goodboy: { type: 'BOOL' },
    category: 'test'
  };

  sql.createTable(table, callback);
};

const select = (data, callback) => {
  const cursor = sql
    .select({
      category: 'test'
    })
    .map(entry => ({ name: entry.name, born: entry.born }))
    .filter(entry => !!entry.born)
    .clone()
    .limit(2)
    .map(entry => new Date(entry.born));

  cursor.fetch((err, res) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(res);
    callback(null);
  });
};

sql.connect('mysql://root@localhost', () => {
  sql.open('test', () => {
    tools.async.sequential([select], console.error);
  });
});
