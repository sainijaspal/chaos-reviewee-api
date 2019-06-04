/**
 * Github Webhooks handler
 */

const eventEmitter = require('events').EventEmitter;
const crypto = require('crypto');
const bufferEq = require('buffer-equal-constant-time');

const config = require('../../config.js');
const { createSequelize } = require('../../infra/sequelize/index.js');
const { createDAL } = require('../../application/dal/index');
const { createHttpRequests } = require('../../application/base/index.js');
const { createServices } = require('../../application/services/index.js');
const { createHelper } = require('../../application/helper/index.js');

let sequelize;
let httpRequests;
let helper;
let services;
let findAllActive;

const signBlob = (key, blob) =>
  `sha1=${crypto
    .createHmac('sha1', key)
    .update(blob)
    .digest('hex')}`;

const isObject = obj =>
  Object.prototype.toString.apply(obj) === '[object Object]';

const findHandler = (url, arr) => {
  let ret = arr[0];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < arr.length; i++) {
    if (url.split('?').shift() === arr[i].webhookPath) {
      ret = arr[i];
    }
  }
  return ret;
};

(async () => {
  /* eslint-disable prefer-destructuring */
  sequelize = await createSequelize();
  httpRequests = createHttpRequests();
  helper = createHelper();
  services = createServices({ httpRequests, helper, config });
  const { organizationDAL } = createDAL({
    sequelize,
    services,
    helper,
    config,
  });
  findAllActive = organizationDAL.findAllActive;
  /* eslint-enable prefer-destructuring */
})();

function create() {
  // make it an EventEmitter, sort of
  handler.__proto__ = eventEmitter.prototype; // eslint-disable-line no-use-before-define, no-proto
  eventEmitter.call(handler); // eslint-disable-line no-use-before-define

  return handler; // eslint-disable-line no-use-before-define

  function handler(req, res, callback) {
    function hasError(msg) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          error: msg,
        }),
      );

      const err = new Error(msg);
      handler.emit('error', err, req);
      callback(err);
    }

    function checkType(options) {
      if (!isObject(options)) {
        throw new TypeError('must provide an options object');
      }

      if (typeof options.webhookPath !== 'string') {
        throw new TypeError("must provide a 'webhookPath' option");
      }

      if (typeof options.webhookSecret !== 'string') {
        throw new TypeError("must provide a 'webhookSecret' option");
      }
    }

    // get the organizations from database
    findAllActive(options => {
      if (options.length <= 0) {
        return hasError('X-Hub-Signature does not match blob signature');
      }
      options.forEach(option => {
        option.webhookPath = `/${option.webhookPath}`; // eslint-disable-line no-param-reassign
      });
      let currentOptions;
      if (Array.isArray(options)) {
        currentOptions = findHandler(req.url, options);
      } else {
        currentOptions = options;
      }

      checkType(currentOptions);

      if (req.url.split('?').shift() !== currentOptions.webhookPath) {
        return callback();
      }

      const sig = req.headers['x-hub-signature'];
      const event = req.headers['x-github-event'];
      const id = req.headers['x-github-delivery'];
      const { events } = currentOptions;

      if (!sig) {
        return hasError('No X-Hub-Signature found on request');
      }

      if (!event) {
        return hasError('No X-Github-Event found on request');
      }

      if (!id) {
        return hasError('No X-Github-Delivery found on request');
      }

      if (events && events.indexOf(event) === -1) {
        return hasError('X-Github-Event is not acceptable');
      }

      const obj = req.body;
      const computedSig = new Buffer( // eslint-disable-line no-buffer-constructor
        signBlob(currentOptions.webhookSecret, JSON.stringify(req.body)),
      );

      // eslint-disable-next-line no-buffer-constructor
      if (!bufferEq(new Buffer(sig), computedSig)) {
        return hasError('X-Hub-Signature does not match blob signature');
      }

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{"ok":true}');

      const repo = obj.repository && obj.repository.name;
      handler.emit('*', event, repo, obj);
      handler.emit(event, repo, obj);
      if (repo) {
        handler.emit(repo, event, obj);
      }
      return true;
    });
  }
}

module.exports = create;
