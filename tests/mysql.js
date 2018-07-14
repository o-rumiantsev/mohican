'use strict';

const tools = require('common-toolkit');
const Mohican = require('../');
const mc = new Mohican();

const URL = 'mysql://root@localhost';
const DB = 'test';

const connect = (data, callback) => mc.connect(URL, callback);
const open = (data, callback) => mc
  .open(DB, (err, db) => callback(err, { db }));

const close = (data, callback) => (
  mc.close(),
  callback(null)
);

const createTables = ({ db }, callback) => {
  const persons = {
    safe: true,
    name: 'VARCHAR(255)',
    born: 'DATETIME',
    country: 'VARCHAR(255)',
    category: 'person'
  };

  const jobs = {
    safe: true,
    name: 'VARCHAR(255)',
    category: 'jobs'
  };

  const work = {
    safe: true,
    job: { type: 'INT', reference: 'jobs.id' },
    position: 'VARCHAR(255)',
    workerId: { type: 'INT', reference: 'person.id' },
    category: 'work'
  };


  const createPersons = (d, cb) => db.createTable(persons, cb);
  const createJobs = (d, cb) => db.createTable(jobs, cb);
  const createWork = (d, cb) => db.createTable(work, cb);

  tools.async.sequential([
    createPersons,
    createJobs,
    createWork
  ], callback);
};

const createEntries = ({ db }, callback) => {
  const createPersons = (data, cb) => {
    const aleksei = {
      name: 'Aleksei',
      born: new Date(),
      country: 'Brovary',
      category: 'person'
    };

    const diana = {
      name: 'Diana',
      born: new Date(),
      country: 'Pechersk',
      category: 'person'
    };

    const nicita = {
      name: 'Machendos',
      born: new Date(),
      country: 'Trojeschina',
      category: 'person'
    };

    const olia = {
      name: 'O-lambda',
      born: new Date(),
      country: 'Zhitomir',
      category: 'person'
    };

    const createAlexei = (d, c) => db.create(aleksei, c);
    const createDiana = (d, c) => db.create(diana, c);
    const createNicita = (d, c) => db.create(nicita, c);
    const createOlia = (d, c) => db.create(olia, c);

    tools.async.sequential([
      createAlexei,
      createDiana,
      createNicita,
      createOlia
    ], cb);
  };

  const createJob = (data, cb) => {
    const job = {
      name: 'programmer',
      category: 'jobs'
    };

    db.create(job, cb);
  };

  const createWork = (data, cb) => {
    const alexeiId = db.select({
      name: 'Aleksei',
      category: 'person'
    }).fields(['id']);

    const dianaId = db.select({
      name: 'Diana',
      category: 'person'
    }).fields(['id']);

    const nicitaId = db.select({
      name: 'Machendos',
      category: 'person'
    }).fields(['id']);

    const oliaId = db.select({
      name: 'O-lambda',
      category: 'person'
    }).fields(['id']);

    const jobId = db.select({
      name: 'programmer',
      category: 'jobs'
    }).fields(['id']);

    const workerAlexei = {
      job: jobId,
      workerId: alexeiId,
      position: 'Team-Lead, Backend developer',
      category: 'work'
    };

    const workerDiana = {
      job: jobId,
      workerId: dianaId,
      position: 'Full-stack developer',
      category: 'work'
    };

    const workerNicita = {
      job: jobId,
      workerId: nicitaId,
      position: 'Backend developer',
      category: 'work'
    };

    const workerOlia = {
      job: jobId,
      workerId: oliaId,
      position: 'Frontend developer',
      category: 'work'
    };

    const createWorkerAlexei = (d, c) => db.create(workerAlexei, c);
    const createWorkerDiana = (d, c) => db.create(workerDiana, c);
    const createWorkerNicita = (d, c) => db.create(workerNicita, c);
    const createWorkerOlia = (d, c) => db.create(workerOlia, c);

    tools.async.sequential([
      createWorkerAlexei,
      createWorkerDiana,
      createWorkerNicita,
      createWorkerOlia
    ], cb);
  };

  tools.async.sequential([
    createPersons,
    createJob,
    createWork
  ], callback);
};

const select = ({ db }, callback) => {
  const cursor = db
    .select({
      category: 'person'
    })
    .join({
      on: 'work.workerId = person.id',
      category: 'work'
    })
    .join({
      on: 'work.job = jobs.id',
      category: 'jobs'
    })
    .fields([
      'person.id',
      'person.name',
      'person.born',
      'person.country',
      'jobs.name as job',
      'work.position as position',
    ])
    .distinct();

  cursor.fetch((err, data) => {
    if (err) {
      callback(err);
      return;
    }

    console.log(data);
    callback(null);
  });
};

const dropTables = ({ db }, callback) => {
  const dropWork = (d, cb) => db.drop('work', cb);
  const dropJobs = (d, cb) => db.drop('jobs', cb);
  const dropPerson = (d, cb) => db.drop('person', cb);

  tools.async.sequential([
    dropWork,
    dropJobs,
    dropPerson
  ], callback);
};

module.exports = (data, callback) => {
  tools.async.sequential([
    connect,
    open,
    createTables,
    createEntries,
    select,
    dropTables,
    close
  ], callback);
};
