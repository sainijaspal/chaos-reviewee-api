const { describe, it, before, beforeEach, after } = require('mocha');
const assert = require('assert');
const sequelizeFixtures = require('sequelize-fixtures');
const path = require('path');

const config = require('../../../src/config.js');
const { NotFoundError } = require('../../../src/application/helper/errors.js');
const {
  enums: { repositoryPermission, commitStatus },
} = require('../../../src/application/helper/constants.js');
const { createSequelize } = require('../../../src/infra/sequelize/index.js');
const { createDAL } = require('../../../src/application/dal/index');
const {
  createHttpRequests,
} = require('../../../src/application/base/index.js');
const {
  createServices,
} = require('../../../src/application/services/index.js');
const { createHelper } = require('../../../src/application/helper/index.js');

describe('#markAsFixedCommit', () => {
  let sequelize;
  let markAsFixedCommit;
  let httpRequests;
  let helper;
  let services;

  before(async () => {
    sequelize = await createSequelize();
    httpRequests = createHttpRequests();
    helper = createHelper();
    services = createServices({ httpRequests, helper, config });
    const { commitDAL } = createDAL({ sequelize, services, helper, config });
    markAsFixedCommit = commitDAL.markAsFixedCommit;
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
        path.join(__dirname, '../../fixtures/commit.js'),
      ],
      sequelize.models,
      { log: () => {} },
    ),
  );

  after(() => sequelize.close());

  it('throws if commit detail not found', async () => {
    try {
      await markAsFixedCommit('c2ca53d0-3f1a-11e9-8edb-63fb08840047', 14310604);
    } catch (error) {
      assert(error instanceof NotFoundError);
    }
  });

  it('mark as fixed commit', async () => {
    const {
      uuid: commitUuid,
      repositoryId,
      message: commitMessage,
    } = (await sequelize.models.Commit.findAll())[0];
    const {
      teamMemberId: reviewerId,
    } = (await sequelize.models.TeamMemberRepository.findAll({
      where: {
        repositoryId,
        permission: repositoryPermission.Reviewer,
      },
    }))[0];
    const { uuid, message, status } = await markAsFixedCommit(
      commitUuid,
      reviewerId,
    );
    assert.equal(uuid, commitUuid);
    assert.equal(message, commitMessage);
    assert.equal(status, commitStatus.MarkAsFixed);
  });
});
