const { createHttpServices } = require('./http-request');

const createHttpRequests = () => {
  const httpRequests = createHttpServices();

  return httpRequests;
};

module.exports = { createHttpRequests };
