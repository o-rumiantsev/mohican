'use strict';

const DATATYPES = {
  id: 'INT',
  number: 'DOUBLE',
  string: 'VARCHAR(255)',
  date: 'DATETIME'
};

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

const createTableIfNotExists = scheme => {
  const table = scheme.category;
  const fields = [];

  const idType = DATATYPES.id;
  const idMeta = `id ${idType} AUTO_INCREMENT PRIMARY KEY`;
  fields.push(idMeta);

  for (const field in scheme) {
    if (field === 'id') continue;

    const value = scheme[field];
    let type = null;

    if (value instanceof Date) {
      type = DATATYPES.date;
    } else {
      type = DATATYPES[typeof value];
    }

    const meta = `${field} ${type}`;
    fields.push(meta);
  }


  const query = `CREATE TABLE IF NOT EXISTS ${table} (${fields})`;
  return query;
};

const insert = entry => {
  const table = entry.category;
  const columns = Object.keys(entry);
  const values = Object.values(entry)
    .map(value => {
      if (typeof value === 'string') {
        return `'${value}'`;
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
  createTableIfNotExists,
  insert
};
