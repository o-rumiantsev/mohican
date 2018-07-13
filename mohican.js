'use strict';

const Mohican = function() {
  this.provider = null;
};

module.exports = Mohican;

const url = require('url');
const MongoProvider = require('./lib/mongodb.provider.js');
const MySQLProvider = require('./lib/mysql.provider.js');


const PROVIDERS = {
  mongodb: MongoProvider,
  mysql: MySQLProvider
};

const getProvider = protocol => {
  // Get provider name from URL protocol
  const start = 0;
  const end = protocol.length - 1;
  return protocol.substring(start, end);
};

Mohican.prototype.errors = require('./lib/errors.js');

Mohican.prototype.connect = function(
  // Connect to existng database
  address, // URL string, database address
  callback // function, call after connect
) {
  const { protocol } = url.parse(address);

  if (!protocol) {
    throw new Error(this.errors.ERR_NO_SUCH_PROVIDER);
  }

  const provider = getProvider(protocol);
  const Provider = PROVIDERS[provider];
  this.provider = new Provider();
  this.provider.connect(address, callback);
};

Mohican.prototype.open = function(
  // Open database
  database, // string, name of database to open
  callback // function, err, db => {...}
) {
  this.provider.open(database, err => callback(err, this.provider));
};

Mohican.prototype.close = function() {
  // Close database connection
  this.provider.close();
};
