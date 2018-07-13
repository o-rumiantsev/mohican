'use strict';

const subtests = ['mysql'];

module.exports = subtests
  .map(path => require('./' + path + '.js'));
