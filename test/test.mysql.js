'use strict';

const tools = require('common-toolkit');
const MySQLProvider = require('../lib/mysql.provider.js');
const sql = new MySQLProvider();

const URL = 'mysql://root@localhost';
const DB = 'test';

const connect = (data, callback) => sql.connect(URL, callback);
const open = (data, callback) => sql.open(DB, callback);
const close = (data, callback) => (
  sql.close(),
  callback(null)
);

const compareResults = ([res1], [res2]) => {
  for (const field in res1) {
    if (
      res1[field] !== res2[field]
    ) return false;
  }

  return true;
};

const results = [];

const select = (data, callback) => {
  const idCursor = sql
    .select({ name: 'Aleksei', category: 'test' })
    .fields(['id']);

  sql
    .select({
      originId: idCursor,
      category: 'fakes'
    })
    .fetch((err, res) => {
      if (err) {
        callback(err);
        return;
      }

      results.push(res);
      callback(null);
    });
};

const join = (data, callback) => {
  sql
    .select({
      category: 'fakes'
    })
    .join({
      on: 'test.id = fakes.id',
      category: 'test'
    })
    .fields(['fakes.id', 'originId', 'fakes.category'])
    .fetch((err, res) => {
      if (err) {
        callback(err);
        return;
      }

      results.push(res);
      callback(null);
    });
};

tools.async.sequential([
  connect,
  open,
  select,
  join,
  close
], err => {
  const equality = compareResults(...results)
    ? 'Equal'
    : 'Different';

  console.log(equality);
  console.error(err || 'OK');
});
