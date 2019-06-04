const { describe, it, before, beforeEach, after } = require('mocha');
const assert = require('assert');
const sequelizeFixtures = require('sequelize-fixtures');
const path = require('path');

const config = require('../../../src/config.js');
const { createSequelize } = require('../../../src/infra/sequelize/index.js');
const { createDAL } = require('../../../src/application/dal/index');
const {
  createHttpRequests,
} = require('../../../src/application/base/index.js');
const {
  createServices,
} = require('../../../src/application/services/index.js');
const { createHelper } = require('../../../src/application/helper/index.js');

describe('#getRepositories', () => {
  let sequelize;
  let httpRequests;
  let helper;
  let services;
  let getAllRepositories;

  before(async () => {
    /* eslint-disable prefer-destructuring */
    sequelize = await createSequelize();
    httpRequests = createHttpRequests();
    helper = createHelper();
    services = createServices({ httpRequests, helper, config });
    const { repositoryDAL } = createDAL({
      sequelize,
      services,
      helper,
      config,
    });
    getAllRepositories = repositoryDAL.getAllRepositories;
    /* eslint-enable prefer-destructuring */
  });

  beforeEach(() => sequelize.truncate());

  beforeEach(() =>
    sequelizeFixtures.loadFiles(
      [
        path.join(__dirname, '../../fixtures/organization.js'),
        path.join(__dirname, '../../fixtures/technology.js'),
        path.join(__dirname, '../../fixtures/repository.js'),
      ],
      sequelize.models,
      { log: () => {} },
    ),
  );

  after(() => sequelize.close());

  it('get the list of repositories', async () => {
    const {
      organizationId,
    } = (await sequelize.models.Organization.findAll())[0];
    const result = await getAllRepositories(organizationId);
    assert.equal(result.length, 3);
  });
});
