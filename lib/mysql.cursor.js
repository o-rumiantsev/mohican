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

MySQLCursor.prototype.fetch = function(
  // Fetch data
  callback // function, err => {...}
) {
  const table = this.query.category;
  const query = `SELECT * FROM ${table}`;
  
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
