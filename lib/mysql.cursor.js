'use strict';

const MySQLCursor = function(
  // MySQLCursor constructor
  query, // object, MySQL query object
  connection // object, MySQL connection object
) {
  this.query = query;
  this.connection = connection;
};

module.exports = MySQLCursor;

const EMPTY_CONDITION = '';
const WHERE_CLAUSE = 'WHERE';

const parseConditions = query => {
  const fields = Object.keys(query);

  if (fields.length === 1) return EMPTY_CONDITION;

  const conditions = [];
  for (const field in query) {
    const value = query[field];

    [`${field}`, '=', `'${value}'`].forEach(
      unit => conditions.push(unit)
    );

    conditions.push('AND');
  }

  // Remove last 'AND' operator
  conditions.pop();
  return WHERE_CLAUSE + ' ' + conditions.join(' ');
};

MySQLCursor.prototype.fetch = function(
  // Fetch data
  callback // function, err => {...}
) {
  const table = this.query.category;
  const conditions = parseConditions(this.query);
  const query = `SELECT * FROM ${table} ${conditions}`;

  this.connection.query(query, (err, rawData) => {
    if (err) {
      callback(err);
      return;
    }

    const data = rawData.map(
      packet => Object.assign({}, packet)
    );

    callback(null, data);
  });
};
