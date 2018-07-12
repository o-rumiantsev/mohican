'use strict';

const lib = require('./mysql.lib.js');
const ALL_FIELDS = '*';

const MySQLCursor = function(
  // <ohican MySQL cursor constructor
  query, // object, MySQL selection query object
  connection // object, MySQL connection object
) {
  this.isCursor = true;

  if (query instanceof MySQLCursor) {
    const cursor = query;
    this.query = Object.assign({}, cursor.query);
    this.connection = cursor.connection;
    this.joins = [...cursor.joins];
    this.operations = [...cursor.operations];
    this._orderBy = [...cursor._orderBy];
    this._distinct = cursor._distinct;
    this._fields = Array.isArray(cursor._fields)
      ? [...cursor._fields]
      : ALL_FIELDS;
  } else {
    this.query = query;
    this.joins = [];
    this.operations = [];
    this._fields = ALL_FIELDS;
    this._distinct = null;
    this._orderBy = [];
    this.connection = connection;
  }
};

module.exports = MySQLCursor;

MySQLCursor.prototype.join = function(
  // MySQL join another table
  joinOptions // object, { on(link), category(table) }
) {
  this.joins.push(joinOptions);
  return this;
};

MySQLCursor.prototype.clone = function() {
  // Create new cursor from existing one
  return new MySQLCursor(this);
};

MySQLCursor.prototype.map = function(
  // Map selected data
  fn // function, apply to every selected item
) {
  this.operations.push({ op: 'map', fn });
  return this;
};

MySQLCursor.prototype.filter = function(
  // Filter selected data
  fn // function, apply to every selected item
) {
  this.operations.push({ op: 'filter', fn });
  return this;
};

MySQLCursor.prototype.limit = function(
  // Limit selected data
  count // number, limitation count
) {
  this.operations.push({ op: 'limit', count });
  return this;
};

MySQLCursor.prototype.fields = function(
  // Specify fields to fetch
  fields // array of strings, fields names
) {
  this._fields = fields.join();
  return this;
};

MySQLCursor.prototype.order = function(
  // Order selected data by given fields
  fields // array of strings, fields to order by
) {
  const order = fields.join();
  this._orderBy = 'ORDER BY ' + order;
  return this;
};

MySQLCursor.prototype.distinct = function(
  // Select distinct entries with specified fields
  fields // string or array of strings, distinct fields
) {
  let distinct = '';

  if (!fields) {
    distinct = 'DISTINCT *';
  } else if (typeof fields === 'string') {
    distinct = `DISTINCT ${fields}`;
  } else if (Array.isArray(fields)) {
    distinct = `DISTINCT ${fields.join()}`;
  }

  this._distinct = distinct;
  return this;
};

MySQLCursor.prototype.fetch = function(
  // Fetch data
  callback // function, err => {...}
) {
  const query = this.toSQLString();
  this.connection.query(query, (err, rawData) => {
    if (err) {
      callback(err);
      return;
    }

    const data = rawData.map(
      packet => Object.assign({}, packet)
    );

    const result = this._applyOperations(data);
    callback(null, result);
  });
};

MySQLCursor.prototype.toSQLString = function() {
  // Create SQL query string from current cursor
  const table = this.query.category;
  const join = lib.prepareJoin(this.joins);
  const conditions = lib.prepareConditions(this.query);
  const order = this._orderBy;
  const fields = this._distinct
    ? this._distinct
    : this._fields;

  const query = `SELECT ${fields} FROM ${table} ` +
    `${join} ${order} ${conditions}`;
  return query;
};

MySQLCursor.prototype._applyOperations = function(
  // Apply cursor operations to fetched data
  data // array of objects, fetched data
) {
  const applyOperation = operation => {
    const { op } = operation;

    if (op === 'map') {
      const { fn } = operation;
      data = data.map(fn);
    } else if (op === 'filter') {
      const { fn } = operation;
      data = data.filter(fn);
    } else if (op === 'limit') {
      const { count } = operation;
      data = data.slice(0, count);
    }
  };

  this.operations.forEach(applyOperation);
  this.operations = [];

  return data;
};
