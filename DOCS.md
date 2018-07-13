# Documentation for Mohican
#### Version 0.2.7
___
## Class Mohican
Mohican instances has methods which allow you to connect to data base managment systems(DBMS), open databases and close 
connection.

## connect(url, callback)
 - url - *string*, URL of database server
 - callback - *function*, `err => {...}`
 
 With `Mohican.connect` you can connect different DBMS. To specify what DBMS to use, just pass it's name as a
 protocol name in URL string. So, if you want to connect to MongoDB url will look like `mongodb://...` and if you want
 to connect to MySQL url will look like `mysql://...`. In version 0.2.7 it is available to use only MySQL provider.
 
## open(name, callback)
 - name - *string*, name of database to connect
 - callback - *function*, `(err, db) => {...}`
 
 `Mohican.open` allows you to open databases in selected DBMS. It returns to callback instance of DBMS provider such as 
 `MongoProvider` or `MySQLProvider`.

## close()
 `Mohican.close` close provider connection to database

___
## Providers
All providers for Mohican has common interface to simplify its usage. There are some additional functionality for SQL 
providers, such as MySQL or PostgreSQL. In version 0.2.7 its only MySQL provider available. Here is a common providers 
interface

## select(query)
 - query - *object*, selection query filter
 - Returns: Cursor
 
 `Provider.select` takes only one argument - selection query. It requires `category` field to identify in which collection
 or table to search. Return value is a new cursor built for this query.
 
## create(entry, callback)
 - entry - *object*, entry to insert into database
 - callback - *function*, (err, id) => {...}
 
 This method creates a new entry in opened database. `entry` requires `category` field. `{ category: 'test' }` means that
 entry should be created in table `test`. `Provider` returns to callback id of inserted entry.
 
## update(entry, callback)
 - entry - *object*, update
 - callback - *function*, err => {...}
 
 `entry` parameter requires `id` and `category` fields. `id` is used to identify which entry it should update and `category`
 identify collection or table. All other fields will rewrite older ones. For example if you pass to `Provider.update` object
 `{ id: 1, name: 'Vasia', category: 'person' }`, it will find entry with id 10 in 'person' category and set its name to 
 'Vasia'.
 
## delete(filter, callback)
 - filter - *object*, filter mask
 - callback - *function*, err => {...}
 
 `Provider.delete` deletes all entries which match filter mask. Also `filter` object requires `category` field. So, if 
 you call `delete` method with filter parameter `{ id: { $gt: 10  }, category: 'person' }`, there will be deleted all entries
 in 'person' category that has id greater than 10.
 
 ___
 ## Cursor
 Cursor is an object which handles information about what data to fetch from db and what operations perform on it. Mohican 
 Cursor behavior is close to MongoDB one. There are different Cursor classes in Mohican library, but all of them has common
 interface, adn SQL Cursor has additional functionality, to support complex SQL queries. Here is common Cursor interface
 
 ## fetch(callback)
  - callback - *function*, (err, data) => {...}
  
  `fetch` method is an end of Cursor life. All data, that Cursor points, comes to callback as `data` parameter. It is the
  only one asynchonous Cursor method.
  
 ## clone()
  - Returns: new Cursor
  
  `Cursor.clone()` returns new Cursor with all saved operations and selection query.
  
 ## map(fn)
  - fn - *function*, item => {...}
  - Returns: Cursor
  
  `Cursor.map` method adds `fn` to queue as `map` operation, it will be performed on data when `fetch` method of Cursor wiil 
  be called.
  
 ## filter(fn)
  - fn - *function*, item => {...}
  - Returns: Cursor
  
  Its principle is the same as `map` method one, but it adds `filter` operation to the queue.
  
 ## limit(count)
  - count - *number*, limitation count
  - Returns: Cursor
  
  Limit count of entries to fetch. Principle is the same as `filter` and `map` one.
  
 ## order(fields)
  - fields - *array*, field to order by
  - Returns: Cursor
  
  Sorts fetched data by appropriate fields.
  
 ## distinct([fields])
  - fields - *array | string*, optional, fields to fetch
  - Returns: Cursor
  
  `Cursor.distinct` with no parameters tell Cursor to fetch only distinct entries with all fields. If you specify one field 
  with string it will tell Cursor to fetch only this field from all entries and only distinct one. Whether you specify array
  of fields it will tell Cursor to fetch only this field from all entries and only distinct ones.
  
  
