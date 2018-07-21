'use strict';

const lib = require('./mongodb.lib.js');

const MongoCursor = function(
  // MongoCursor constructor
  cursor // Existig MongoDB cursor
) {
  this.cursor = cursor;
  this.operations = [];
};

module.exports = MongoCursor;

MongoCursor.prototype.clone = function() {
  // Clone the cursor
  const cursor = this.cursor.clone();
  const mongoCursor = new MongoCursor(cursor);
  mongoCursor.operations = [...this.operations];
  return mongoCursor;
};

MongoCursor.prototype.fetch = function(
  // Fetch data
  callback // function, (error, data) => {...}
) {
  this.cursor.toArray((err, data) => {
    if (err) {
      callback(err);
      return;
    }

    if (this.operations.length) data = this._applyOperations(data);
    callback(null, data);
  });
};

MongoCursor.prototype.map = function(
  // Map selected data using the provided function
  fn // function to apply to every selected item
) {
  this.operations.push({ op: 'map', fn });
  return this;
};

MongoCursor.prototype.project = function(
  // Specify fields to fetch
  fields // array of strings, fields names
) {
  const INCLUDE = 1;
  const projection = { _id: 0 };

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

MongoCursor.prototype.distinct = function(
  fields
) {
  const fn = lib.getUnique.bind(null, fields);
  this.operations.push({ op: 'distinct', fn });
  return this;
};

MongoCursor.prototype._applyOperations = function(
  data
) {
  const applyOperation = operation => {
    const { op } = operation;

    if (op === 'map') {
      const { fn } = operation;
      data = data.map(fn);
    } else if (op === 'distinct') {
      const { fn } = operation;
      data = fn(data);
    }
  };

  this.operations.forEach(applyOperation);
  this.operations = [];

  return data;

};
