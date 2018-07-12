'use strict';

const MySQLCursor = require('./mysql.cursor.js');
const CATEGORY_META = 'category VARCHAR(255)';

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

const createTable = scheme => {
  const table = scheme.category;
  const fields = [];
  const safe = scheme.safe
    ? 'IF NOT EXISTS'
    : '';

  for (const field in scheme) {
    if (field === 'safe') {
      continue;
    } else if (field === 'category') {
      const meta = CATEGORY_META;
      fields.push(meta);
      continue;
    }

    const { type } = scheme[field];
    let { options } = scheme[field];

    if (Array.isArray(options)) {
      options = options.join(' ');
    } else if (typeof options === 'object') {
      const { reference } = options;
      const [remoteTable, remoteField] = reference.split('.');
      options = `, FOREIGN KEY (${field}) ` +
        `REFERENCES ${remoteTable}(${remoteField})`;
    } else {
      options = '';
    }

    const meta = `${field} ${type} ${options}`;
    fields.push(meta);
  }

  const query = `CREATE TABLE ${safe} ${table} (${fields})`;
  return query;
};

const insert = entry => {
  const table = entry.category;
  const columns = Object.keys(entry);
  const values = Object.values(entry)
    .map(value => {
      if (typeof value === 'string') {
        return `'${value}'`;
      } else if (value instanceof Date) {
        return `'${value.toLocaleString()}'`;
      } else if (value instanceof MySQLCursor) {
        return `(${value.toSQLString()})`;
      }

      return value;
    });

  const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
  return query;
};

module.exports = {
  use,
  createDatabase,
  createDatabaseIfNotExists,
  createTable,
  insert
};
