'use strict';

const compare = (
  obj1,
  obj2,
  fields = Object.keys(obj1)
) => {
  if (typeof obj1 !== typeof obj2) return false;

  if (
    Object.keys(obj1).length !== Object.keys(obj2).length
  ) return false;

  fields = fields.filter(
    field => !['_id', 'id'].includes(field)
  );

  const equal = fields.every(
    field => typeof obj1[field] === 'object'
      ? compare(obj1[field], obj2[field])
      : obj1[field] === obj2[field]
  );

  return equal;
};

const getUnique = (fields, data) => {
  const result = [];

  if (fields) data = data.filter(
    doc => typeof doc === 'object'
  );

  data.forEach((document, index) => {
    let unique = true;
    for (let i = ++index; i < data.length; i++) {
      if (typeof document !== typeof data[i]) {
        continue;
      } else if (typeof document === 'object') {
        const equal = compare(document, data[i], fields);
        if (equal) {
          unique = false;
          break;
        }
      } else {
        const equal = document === data[i];
        if (equal) {
          unique = false;
          break;
        }
      }
    }

    if (unique) result.push(document);
  });

  return result;
};

module.exports = {
  compare,
  getUnique
};
