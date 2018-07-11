'use strict';

const ALL_FIELDS = '*';

const MySQLCursor = function(
  // MySQLCursor constructor
  query, // object, MySQL selection query object
  connection // object, MySQL connection object
) {
  if (query instanceof MySQLCursor) {
    const cursor = query;
    this.query = Object.assign({}, cursor.query);
    this.connection = cursor.connection;
    this.joins = [...cursor.joins];
    this.operations = [...cursor.operations];
    this._fields = Array.isArray(cursor._fields)
      ? [...cursor._fields]
      : ALL_FIELDS;
  } else {
    this.query = query;
    this.joins = [];
    this.operations = [];
    this._fields = ALL_FIELDS;
    this.connection = connection;
  }
};

module.exports = MySQLCursor;

const EMPTY_CONDITION = '';
const WHERE_CLAUSE = 'WHERE';

const prepareConditions = query => {
  const fields = Object.keys(query);

  if (fields.length === 1) return EMPTY_CONDITION;

  const conditions = [];
  for (const field in query) {
    let value = query[field];

    if (value instanceof MySQLCursor) {
      const sql = value.toSQLString();
      value = `(${sql})`;
    } else if (typeof value !== 'number') {
      value = `'${value}'`;
    }

    [`${field}`, '=', `${value}`].forEach(
      unit => conditions.push(unit)
    );

    conditions.push('AND');
  }

  // Remove last 'AND' operator
  conditions.pop();
  return WHERE_CLAUSE + ' ' + conditions.join(' ');
};

const prepareJoin = joins => {
  const join = [];

  joins.forEach(({ on, category }) => {
    const joinString = 'JOIN ' + category + ' ON ' + on;
    join.push(joinString);
  });

  return join.join(' ');
};

MySQLCursor.prototype.join = function(
  // MySQL join another table
  joinOptions // object, { on(link), category(table) }
) {
  this.joins.push(joinOptions);
  return this;
};

MySQLCursor.prototype.clone = function() {
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

MySQLCursor.prototype.fields = function(fields) {
  this._fields = fields.join();
  return this;
};

MySQLCursor.prototype.toSQLString = function() {
  const table = this.query.category;
  const fields = this._fields;
  const conditions = prepareConditions(this.query);
  const join = prepareJoin(this.joins);
  const query = `SELECT ${fields} FROM ${table} ${join} ${conditions}`;
  return query;
};

MySQLCursor.prototype._applyOperations = function(data) {
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

  const len = this.operations.length;
  for (let i = 0; i < len; ++i) {
    const operation = this.operations.shift();
    applyOperation(operation);
  }

  return data;
};
