const Rollbar = require('rollbar');
const { rollbarAccessToken } = require('../config');

const reporter = rollbarAccessToken
  ? new Rollbar({
      accessToken: rollbarAccessToken,
      captureUnhandledRejections: true,
    })
  : console;

module.exports = { reportError: error => reporter.error(error) };
