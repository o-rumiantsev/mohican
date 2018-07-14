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

MongoCursor.prototype.limit = function(count) {
  const cursor = this.cursor.limit(count);
  return new MongoCursor(cursor);
};

MongoCursor.prototype.order = function(fields) {
  const ASC = 1;
  const DESC = -1;
  const query = {};

  fields.forEach(field => {
    if (Array.isArray(field)) {
      field.reduce(
        (obj, key) => (obj[key] = DESC, obj), query
      );
    } else {
      query[field] = ASC;
    }
  });

  const cursor = this.cursor.sort(query);
  return new MongoCursor(cursor);
};
