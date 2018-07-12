'use strict';

const MongoCursor = function(
  // MongoCursor constructor
  cursor // Existig MongoDB cursor
) {
  this.cursor = cursor;
};

module.exports = MongoCursor;

MongoCursor.prototype.clone = function() {
  const cursor = this.cursor.clone();
  return new MongoCursor(cursor);
};

MongoCursor.prototype.fetch = function(
  // Fetch data
  callback // function, (error, data) => {...}
) {
  this.cursor.toArray(callback);
};

MongoCursor.prototype.map = function(fn) {
  const cursor = this.cursor.map(fn);
  return new MongoCursor(cursor);
};

MongoCursor.prototype.filter = function(filter) {
  const cursor = this.cursor.filter(filter);
  return new MongoCursor(cursor);
};

MongoCursor.prototype.project = function(value) {
  const cursor = this.cursor.project(value);
  return new MongoCursor(cursor);
};

MongoCursor.prototype.limit = function(value) {
  const cursor = this.cursor.limit(value);
  return new MongoCursor(cursor);
};
