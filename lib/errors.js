'use strict';

const errors = {
  ERR_NOT_CONNECTED: 'not connected',
  ERR_CATEGORY_REQUIRED: '`category` required',
  ERR_NO_SUCH_PROVIDER: 'no such provider'
};

const mixinErrors = Mohican => {
  Object.assign(Mohican.prototype, { errors });
};

module.exports = mixinErrors;
