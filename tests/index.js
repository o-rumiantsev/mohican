'use strict';

const subtests = ['mysql', 'mongodb'];

module.exports = subtests
  .map(path => require('./' + path + '.js'));
