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

describe('#getCollaborators', () => {
  let sequelize;
  let httpRequests;
  let helper;
  let services;
  let getAllCollaborators;

  before(async () => {
    /* eslint-disable prefer-destructuring */
    sequelize = await createSequelize();
    httpRequests = createHttpRequests();
    helper = createHelper();
    services = createServices({ httpRequests, helper, config });
    const { collaboratorDAL } = createDAL({
      sequelize,
      services,
      helper,
      config,
    });
    getAllCollaborators = collaboratorDAL.getAllCollaborators;
    /* eslint-enable prefer-destructuring */
  });

  beforeEach(() => sequelize.truncate());

  beforeEach(() =>
    sequelizeFixtures.loadFiles(
      [
        path.join(__dirname, '../../fixtures/organization.js'),
        path.join(__dirname, '../../fixtures/teamMember.js'),
        path.join(__dirname, '../../fixtures/technology.js'),
        path.join(__dirname, '../../fixtures/repository.js'),
        path.join(__dirname, '../../fixtures/teamMemberRepository.js'),
      ],
      sequelize.models,
      { log: () => {} },
    ),
  );

  after(() => sequelize.close());

  it('get the collaborators of repository', async () => {
    const {
      id: repositoryId,
    } = (await sequelize.models.Repository.findAll())[0];
    const result = await getAllCollaborators(repositoryId);
    assert.equal(result.length, 4);
  });
});
