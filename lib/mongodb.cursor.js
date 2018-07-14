'use strict';

const MongoCursor = function(
  // MongoCursor constructor
  cursor // Existig MongoDB cursor
) {
  this.cursor = cursor;
};

module.exports = MongoCursor;

MongoCursor.prototype.clone = function() {
  // Clone the cursor
  const cursor = this.cursor.clone();
  return new MongoCursor(cursor);
};

MongoCursor.prototype.fetch = function(
  // Fetch data
  callback // function, (error, data) => {...}
) {
  this.cursor.toArray(callback);
};

MongoCursor.prototype.map = function(
  // Map selected data using the provided function
  fn // function to apply to every selected item
) {
  const cursor = this.cursor.map(fn);
  return new MongoCursor(cursor);
};

MongoCursor.prototype.project = function(
  // Specify fields to fetch
  fields // array of strings, fields names
) {
  const INCLUDE = 1;
  const projection = {};

  fields.reduce(
    (obj, key) => (obj[key] = INCLUDE, obj),
    projection
  );

  const cursor = this.cursor.project(projection);
  return new MongoCursor(cursor);
};

MongoCursor.prototype.limit = function(
  // Limit selected data
  count // number, limitation count
) {
  const cursor = this.cursor.limit(count);
  return new MongoCursor(cursor);
};

MongoCursor.prototype.order = function(
  // Order selected data by given fields
  fields // array of strings, fields to order by
) {
  const ASC = 1;
  const DESC = -1;
  const query = {};

  fields.forEach(field => {
    if (Array.isArray(field)) {
      field.reduce(
        (obj, key) => (obj[key] = DESC, obj),
        query
      );
    } else {
      query[field] = ASC;
    }
  });

  const cursor = this.cursor.sort(query);
  return new MongoCursor(cursor);
};
