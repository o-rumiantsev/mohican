# Mohican
Generalized database managment interface.

This is a collection of independent database managment systems, united by common interface, so it does not matter whether you use mongodb or mysql.

# Example
To use Mohican you must connect to existing database server:
```javascript
// Connect to database
mohican.connect(
  url, //  string, database url, you are going to use
  callback // function, err => {...}
);
```

And then do anything you need:
```javascript
const db = mohican.open('someDatabase');

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
  id, // number, id of entry to delete
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
```
