'use strict';

const tools = require('common-toolkit');
const Mohican = require('../');
const mc = new Mohican();

const URL = 'mongodb://localhost:27017';
const DB = 'test';

const connect = (data, callback) => mc.connect(URL, callback);
const open = (data, callback) => mc
  .open(DB, (err, db) => callback(err, { db }));

const close = (data, callback) => (
  mc.close(),
  callback(null)
);

const createEntries = ({ db }, callback) => {
  const createPersons = (data, cb) => {
    const alexei = {
      name: 'Alexei',
      born: new Date('25 Oct 1999'),
      country: 'Brovary',
      category: 'person'
    };

    const diana = {
      name: 'Diana',
      born: new Date('01 Jan 2000'),
      country: 'Pechersk',
      category: 'person'
    };

    const nicita = {
      name: 'Machendos',
      born: new Date('29 Jun 2000'),
      country: 'Trojeschina',
      category: 'person'
    };

    const olia = {
      name: 'O-lambda',
      born: new Date('20 Nov 1999'),
      country: 'Zhitomir',
      category: 'person'
    };

    const createAlexei = (d, c) => db.create(alexei, c);
    const createDiana = (d, c) => db.create(diana, c);
    const createNicita = (d, c) => db.create(nicita, c);
    const createOlia = (d, c) => db.create(olia, c);

    tools.async.sequential([
      createAlexei,
      createDiana,
      createNicita,
      createOlia
    ], err => cb(err, { alexei, diana, nicita, olia }));
  };

  const createJob = (data, cb) => {
    const job = {
      name: 'programmer',
      category: 'jobs'
    };

    db.create(job, err => cb(err, { job }));
  };

  const createWork = ({ alexei, diana, nicita, olia, job }, cb) => {
    const workerAlexei = {
      job: job.id,
      workerId: alexei.id,
      position: 'Team-Lead, Backend developer',
      category: 'work'
    };

    const workerDiana = {
      job: job.id,
      workerId: diana.id,
      position: 'Full-stack developer',
      category: 'work'
    };

    const workerNicita = {
      job: job.id,
      workerId: nicita.id,
      position: 'Backend developer',
      category: 'work'
    };

    const workerOlia = {
      job: job.id,
      workerId: olia.id,
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
    .project([
      'name',
      'born',
      'country',
    ])
    .order(['born']);

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
    createEntries,
    select,
    dropTables,
    close
  ], callback);
};
