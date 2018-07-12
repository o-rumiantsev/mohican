'use strict';

const MongoProvider = function() {
  this.connection = null;
};

module.exports = MongoProvider;

const tools = require('common-toolkit');
const { MongoClient } = require('mongodb');
const MongoCursor = require('./mongodb.cursor.js');

MongoProvider.prototype.errors = require('./errors.js');

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
  this._findMaxId((err, { id }) => {
    if (err) {
      callback(new Error(this.errors.ERR_CANNOT_FIND_MAX_ID));
      return;
    }

    this.entryId = ++id;
    callback(null);
  });
};

MongoProvider.prototype.close = function() {
  this.database = null;
  this.connection.close();
};

MongoProvider.prototype.create = function(entry, callback) {
  const { category } = entry;

  if (!category) {
    throw new Error(this.errors.ERR_CATEGORY_REQUIRED);
  }

  const collection = this.database.collection(category);
  Object.assign(entry, { _id: this.entryId, id: this.entryId });

  ++this.entryId;
  collection.insertOne(entry, err => callback(err, entry.id));
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

MongoProvider.prototype.update = function(query, callback) {
  const { category, id } = query;

  if (!category) {
    throw new Error(this.errors.ERR_CATEGORY_REQUIRED);
  } else if (!id) {
    throw new Error(this.errors.ERR_ID_REQUIRED);
  }

  const collection = this.database.collection(category);
  const filter = { _id: id };
  const update = { $set: query };
  collection.updateOne(filter, update, callback);
};

MongoProvider.prototype.delete = function(entry, callback) {
  const { category, id } = entry;

  if (!category) {
    throw new Error(this.errors.ERR_CATEGORY_REQUIRED);
  }

  const collection = this.database.collection(category);
  const filter = id
    ? { _id: id }
    : entry;

  if (id) collection.deleteOne(filter, callback);
  else collection.deleteMany(filter, callback);
};

MongoProvider.prototype.drop = function(category) {
  const collection = this.database.collection(category);
  collection.drop();
};

MongoProvider.prototype._getMaxId = entries => {
  entries = entries.sort(
    (entry1, entry2) => entry2.id - entry1.id
  );

  const id = entries.length
    ? entries[0].id
    : null;

  return id;
};

MongoProvider.prototype._findMaxId = function(callback) {
  this.database
    .listCollections()
    .toArray((error, collections) => {
      if (error) {
        callback(error);
        return;
      }

      collections = collections.map(coll => coll.name);

      const fns = collections.map(name => ({ id }, cb) => this.database
      .collection(name)
      .find({})
      .toArray((err, entries) => {
        if (err) {
          cb(err);
        } else {
          const maxId = Math.max(id, this._getMaxId(entries));
          cb(null, { id: maxId });
        }
      })
    );

    tools.async.sequential(fns, { id: 1 }, callback);
  });
};
