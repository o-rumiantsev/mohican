'use strict';

// MySQL query constructors

const lib = require('./mysql.lib.js');
const CATEGORY_META = 'category VARCHAR(255)';
const ID_META = {
  type: 'INT',
  options: ['AUTO_INCREMENT', 'PRIMARY KEY']
};

// Prepare value by its type
// value - value to be placed in SQL query
//
const prepareValue = value => {
  if (typeof value === 'string') {
    return `'${value}'`;
  } else if (value instanceof Date) {
    return `'${value.toLocaleString()}'`;
  } else if (value.isCursor) {
    return `(${value.toSQLString()})`;
  }

  return value;
};

// Prepare query to use database
// databaseName - name of database to use
//
const use = databaseName => {
  const query = `USE ${databaseName}`;
  return query;
};

// Prepare query to create database
// databaseName - name of database to create
//
const createDatabase = databaseName => {
  const query = `CREATE DATABASE ${databaseName}`;
  return query;
};

// Prepare query to create database if one not exists
// databaseName - name of database to create
//
const createDatabaseIfNotExists = databaseName => {
  const query = `CREATE DATABASE IF NOT EXISTS ${databaseName}`;
  return query;
};

// Prepare query to create table by given scheme
// scheme - object, keys - columns names,
//                  values - columns options such as type or reference
//
const createTable = scheme => {
  scheme.id = scheme.id || ID_META;
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
    let { reference } = scheme[field];

    if (options) {
      options = options.join(' ');
    } else {
      options = '';
    }

    if (reference) {
      const [remoteTable, remoteField] = reference.split('.');
      reference = `, FOREIGN KEY (${field}) ` +
        `REFERENCES ${remoteTable}(${remoteField})`;
    } else {
      reference = '';
    }

    const meta = `${field} ${type} ${options} ${reference}`;
    fields.push(meta);
  }

  const query = `CREATE TABLE ${safe} ${table} (${fields})`;
  return query;
};

// Prepare query to drop table
// category - table name
//
const drop = category => {
  const query = `DROP TABLE ${category}`;
  return query;
};

// Prepare query to insert entry
// entry - object to be inserted
// WARN! DO NOT PASS `id` TO `entry` OBJECT
//
const insert = entry => {
  const table = entry.category;
  const columns = Object.keys(entry);
  const values = Object.values(entry)
    .map(value => prepareValue(value));

  const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
  return query;
};

// Prepare query to delete entries
// filter - object, filter mask for entries to delete
//
const del = filter => {
  const table = filter.category;
  const conditions = lib.prepareConditions(filter);
  const query = `DELETE FROM ${table} ${conditions}`;
  return query;
};

// Prepare entry to update entry
// entry - object, entry to be updated
//
const update = entry => {
  const table = entry.category;
  const id = entry.id.isCursor
    ? entry.id.toSQLString()
    : entry.id;

  const updates = [];

  for (const field in entry) {
    if (
      field === 'id' || field === 'category'
    ) continue;

    const value = prepareValue(entry[field]);
    const set = `${field} = ${value}`;
    updates.push(set);
  }

  const query = `UPDATE ${table} SET ${updates} WHERE id = (${id})`;
  return query;
};

module.exports = {
  use,
  createDatabase,
  createDatabaseIfNotExists,
  createTable,
  drop,
  insert,
  del,
  update
};
