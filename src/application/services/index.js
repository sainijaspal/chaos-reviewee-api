const { createGithubServices } = require('./github-service');
const { createRollbarServices } = require('./rollbar-service');

const createServices = ({ httpRequests, helper, config }) => {
  const githubServices = createGithubServices({ httpRequests, helper, config });
  const rollbarServices = createRollbarServices();

  return {
    githubServices,
    rollbarServices,
  };
};

module.exports = { createServices };
