'use strict';

const MongoProvider = function() {
  this.connection = null;
};

module.exports = MongoProvider;

const { MongoClient } = require('mongodb');
const mixinErrors = require('./errors.js');
const MongoCursor = require('./mongodb.cursor.js');

mixinErrors(MongoProvider);

const OPTIONS = {
  useNewUrlParser: true
};

MongoProvider.prototype.connect = function(url, callback) {
  MongoClient.connect(
    url,
    OPTIONS,
    (err, connection) => {
      if (err) {
        callback(err);
        return;
      }

      this.connection = connection;
      callback(null);
    }
  );
};

MongoProvider.prototype.open = function(name, callback) {
  if (!this.connection) {
    const err = new Error(this.errors.ERR_NOT_CONNECTED);
    callback(err);
  }

  this.database = this.connection.db(name);
  callback(null);
};

MongoProvider.prototype.close = function() {
  this.database = null;
  this.connection.close();
};

MongoProvider.prototype.select = function(
  // MongoDb selection method
  query // object, selection mask
) {
  const { category } = query;

  if (!category) {
    throw new Error(this.errors.ERR_CATEGORY_REQUIRED);
  }

  const collection = this.database.collection(category);
  const cursor = collection.find(query);

  return new MongoCursor(cursor);
};
