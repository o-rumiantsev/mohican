'use strict';

const tools = require('common-toolkit');
const tests = require('./tests');

tools.async.sequential(tests, err => {
  if (err) {
    console.error(err);
  } else {
    console.log('OK');
  }
});
