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

const parseConditions = query => {
  const fields = Object.keys(query);

  if (fields.length === 1) return '';

  const conditions = [];
  for (const field in query) {
    if (field === 'category') continue;

    const value = query[field];

    [`${field}`, '=', `'${value}'`].forEach(
      unit => conditions.push(unit)
    );

    conditions.push('AND');
  }

  conditions.pop();
  return 'WHERE ' + conditions.join(' ');
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
