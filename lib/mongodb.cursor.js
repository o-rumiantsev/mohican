'use strict';

const MongoCursor = function(
  // MongoCursor constructor
  cursor // Existig MongoDB cursor
) {
  this.cursor = cursor;
};

MongoCursor.prototype.fetch = function(
  // Fetch data
  callback // function, (error, data) => {...}
) {
  this.cursor.toArray(callback);
};

module.exports = MongoCursor;
