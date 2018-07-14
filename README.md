# Mohican

[![NPM Version](https://badge.fury.io/js/mohican.svg)](https://badge.fury.io/for/js/mohican)
[![NPM Downloads](https://img.shields.io/npm/dt/mohican.svg)](https://www.npmjs.com/package/mohican)

Generalized database managment interface.

This is a collection of independent database managment systems, united by common interface, so it almost does not matter whether you use mongodb, mysql or postgresql.

# Example
To use Mohican you must connect to existing database server:
```javascript
// Connect to database
mohican.connect(
  url, //  string, database url, you are going to use
       //  'mongodb://...', 'mysql://...' etc.
  callback // function, err => {...}
);
```

And then do anything you need:
```javascript
mc.open('someDatabase', (err, db) => {
  if (err) {
    console.error(err);
    return;
  }

  // Create something
  db.create(
    entry, // object
    callback // function, (err, entryId) => {...}
  );

  // Update something
  db.update(
   entry, // object, update parameters
   callback // function, err => {...}
  );

  // Delete something
  db.delete(
   id, // object, { id, category }
   callback // function, err => {...}
  );

  const cursor = db.select({
    /*
   Search mask
   */
  });

  cursor
   .clone()
   .map(fn1)
   .filter(fn2)
   .project(fn3)
   .fetch((err, data) => {...});
  });
```

## Features
MySQL provider for Mohican has some additional functionality. It is easy now to create complex SQL queries.

#### Create table
Now you just need to specify options for each field(column) using object syntax. For example, this SQL query
```sql
CREATE TABLE IF NOT EXISTS table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), born DATETIME, foreignId INT, FOREIGN KEY(foreignId) REFERENCES anotherTable(id))
```
Will look like this:
```javascript
const scheme = {
  // id could be skipped, this is default id meta info
  // RECOMENDED: don`t use 'AUTO_INCREMENT' option for it
  id: { type: 'INT', options: ['PRIMARY KEY'] },

  // specify type like string
  name: 'VARCHAR(255)',
  born: 'DATETIME',

  // or if you need more complex definition, use object definition
  foreignId: { type: 'INT', reference: 'anotherTable.id' },

  // create if not exists
  safe: true
};

mc.createTable(scheme, err => {
  if (err) {
    console.error(err);
  }
});
```

#### Nested selection
Nested selection in SQL:
```sql
SELECT * FROM someTable WHERE someField = (SELECT field FROM anotherTable WHERE id = 12345);
```
Using Mohican it will look like:
```javascript
const somefieldCursor = mc
  .select({
    id: 12345,
    category: 'anotherTable'
  })
  .fields(['field']);

mc
  .select({
    someField: somefieldCursor,
    category: 'someTable'
  })
  .fetch(/* err, data - callback */);
```

#### JOIN
You can also easy implement multiple JOIN operations. So this:
```sql
SELECT table.field, anotherTable.anotherField FROM table JOIN anotherTable ON table.id = anotherTable.id WHERE table.id > 10
```
Could be written like this:
```javascript
mc
  .select({
    'table.id': { $gt: 10 },
    category: 'table'
  })
  .join({
    on: 'table.id = anotherTable.id',
    category: 'anotherTable'
  })
  .fields(['table.field', 'anotherTable.anotherField'])
  .fetch(/* err, data - callback */);
```
___

See [documentation](https://github.com/o-rumiantsev/mohican/blob/master/DOCS.md) for more info
