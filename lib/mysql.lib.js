'use strict';

const MySQLCursor = require('./mysql.cursor.js');
const EMPTY_CONDITION = '';
const WHERE_CLAUSE = 'WHERE';

const appendConditions = conditions => (operator, field, value) => {
  [`${field}`, operator, `${value}`].forEach(
      unit => conditions.push(unit)
    );
};

const agregate = (conditions, field, option) => {
  const append = appendConditions(conditions);
  const key = Object.keys(option)[0];
  let value = option[key];

  if (key === '$in') {
    const values = value.map(
      item => prepareValue(conditions, field, item)
    );

    values.forEach(item => {
      append('=', field, item);
      conditions.push('OR');
    });

    // Remove last 'OR'
    conditions.pop();
  } else if (key === '$gt') {
    value = prepareValue(conditions, field, value);
    append('>', field, value);
  } else if (key === '$gte') {
    value = prepareValue(conditions, field, value);
    append('>=', field, value);
  } else if (key === '$lt') {
    value = prepareValue(conditions, field, value);
    append('<', field, value);
  } else if (key === '$lte') {
    value = prepareValue(conditions, field, value);
    append('<=', field, value);
  }
};

const prepareValue = (
  conds,
  field,
  value
) => {
  if (value instanceof MySQLCursor) {
    const sql = value.toSQLString();
    value = `(${sql})`;
  } else if (typeof value === 'object') {
    agregate(conds, field, value);
    value = null;
  } else if (typeof value !== 'number') {
    value = `'${value}'`;
  }

  return value;
};

const prepareConditions = query => {
  const fields = Object.keys(query);

  if (fields.length === 1) return EMPTY_CONDITION;

  const conditions = [];
  for (const field in query) {
    const value = prepareValue(
      conditions, field, query[field]
    );

    if (!value) { // Agregation happened
      conditions.push('AND');
      continue;
    }

    [`${field}`, '=', `${value}`].forEach(
      unit => conditions.push(unit)
    );

    conditions.push('AND');
  }

  // Remove last 'AND' operator
  conditions.pop();
  return WHERE_CLAUSE + ' ' + conditions.join(' ');
};

const prepareJoin = joins => {
  const join = [];

  joins.forEach(({ on, category }) => {
    const joinString = 'JOIN ' + category + ' ON ' + on;
    join.push(joinString);
  });

  return join.join(' ');
};


module.exports = {
  prepareConditions,
  prepareJoin
};
