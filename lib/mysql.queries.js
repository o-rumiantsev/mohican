'use strict';

const use = databaseName => {
  const query = `USE ${databaseName}`;
  return query;
};

const createDatabase = databaseName => {
  const query = `CREATE DATABASE ${databaseName}`;
  return query;
};

const createDatabaseIfNotExists = databaseName => {
  const query = `CREATE DATABASE IF NOT EXISTS ${databaseName}`;
  return query;
};

module.exports = {
  use,
  createDatabase,
  createDatabaseIfNotExists
};
