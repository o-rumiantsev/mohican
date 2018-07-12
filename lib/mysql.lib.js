'use strict';

const EMPTY_CONDITION = '';
const WHERE_CLAUSE = 'WHERE';

// Prepare function to add
// agregation options to conditions
// conditions - array, conditions in WHERE clause
//
const prepareAgregation = conditions => (
  // Add agregation option to conditions
  operator, // string, agregation option
  field, // string, field name
  value // value, agregation value
) => [`${field}`, operator, `${value}`]
  .forEach(unit => conditions.push(unit));

const agregate = (
  // Prepare agregation options for WHERE clause
  conditions, // array, conditions in WHERE clause
  field, // string, field name
  option // object, agregation option for current field
) => {
  const addOption = prepareAgregation(conditions);
  const key = Object.keys(option)[0];
  let value = option[key];

  if (key === '$in') {
    // IN agregation
    const values = value.map(
      item => prepareValue(conditions, field, item)
    );
    addOption('IN', field, `(${values})`);
  } else if (key === '$gt') {
    // Greater then(>) agregation
    value = prepareValue(conditions, field, value);
    addOption('>', field, value);
  } else if (key === '$gte') {
    // Greater then or equal(>=) agregation
    value = prepareValue(conditions, field, value);
    addOption('>=', field, value);
  } else if (key === '$lt') {
    // Lower then(<) agregation
    value = prepareValue(conditions, field, value);
    addOption('<', field, value);
  } else if (key === '$lte') {
    // Lower then or equal(<=) agregation
    value = prepareValue(conditions, field, value);
    addOption('<=', field, value);
  }
};

const prepareValue = (
  // Prepare value by its type
  conds, // array, conditions in WHERE clause
  field, // string, field name
  value // value to be placed in
  // WHERE clause for appropriate field
) => {
  if (value.isCursor) {
    // If value is MySQL cursor - create SQL string from it
    const sql = value.toSQLString();
    value = `(${sql})`;
  } else if (value instanceof Date) {
    // If value in an intance of Date
    // create locale string from it
    value = `'${value.toLocaleString()}'`;
  } else if (typeof value === 'object') {
    // If value is an object, so
    // it must be an agregation option
    agregate(conds, field, value);
    value = null;
  } else if (typeof value === 'string') {
    // If value is a string wrap it in single quotes
    value = `'${value}'`;
  }

  return value;
};

// Prepare WHERE conditions fron given query
// query - object, collection of conditions
//
const prepareConditions = query => {
  const fields = Object.keys(query);

  // If only category specified
  if (fields.length === 1) return EMPTY_CONDITION;

  const conditions = [];
  for (const field in query) {
    if (field === 'category') continue;

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

// Prepare JOIN clause from given join options
// joins - array of join objects
//
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
