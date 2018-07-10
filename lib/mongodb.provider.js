'use strict';

const { MongoClient } = require('mongodb');

const OPTIONS = {
  useNewUrlParser: true
};

const MongoProvider = function() {
  this.connection = null;
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

MongoProvider.prototype.open = function(name) {
  if (!this.connection) {
    throw new Error(this.errors.ERR_NOT_CONNECTED);
  }

  this.database = this.connection.db(name);
  return this;
};

MongoProvider.prototype.close = function() {
  this.database = null;
  this.connection.close();
};

module.exports = MongoProvider;
