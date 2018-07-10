'use strict';

const Mohican = function() {
  this.provider = null;
};

module.exports = Mohican;

const url = require('url');
const MongoProvider = require('./lib/mongodb.provider.js');

const PROVIDERS = {
  mongodb: MongoProvider
};

const getProvider = protocol => protocol
  .substring(0, protocol.length - 1);

Mohican.prototype.connect = function(
  // Connect to existng database
  address, // URL string, database address
  callback // function, call after connect
) {
  const { protocol } = url.parse(address);
  const provider = getProvider(protocol);
  const Provider = PROVIDERS[provider];
  this.provider = new Provider();
  this.provider.connect(address, callback);
};

Mohican.prototype.open = function(
  // Open database
  database // string, name of database to open
) {
  this.provider.open(database);
  return this.provider;
};
