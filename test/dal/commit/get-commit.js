const { describe, it, before, beforeEach, after } = require('mocha');
const assert = require('assert');
const path = require('path');
const sequelizeFixtures = require('sequelize-fixtures');

const config = require('../../../src/config.js');
const { NotFoundError } = require('../../../src/application/helper/errors.js');
const { createSequelize } = require('../../../src/infra/sequelize/index.js');
const { createDAL } = require('../../../src/application/dal/index');
const {
  createHttpRequests,
} = require('../../../src/application/base/index.js');
const {
  createServices,
} = require('../../../src/application/services/index.js');
const { createHelper } = require('../../../src/application/helper/index.js');

describe('#getCommit', () => {
  let sequelize;
  let httpRequests;
  let helper;
  let services;
  let getCommitDetail;

  before(async () => {
    sequelize = await createSequelize();

    httpRequests = createHttpRequests();
    helper = createHelper();
    services = createServices({ httpRequests, helper, config });
    const { commitDAL } = createDAL({ sequelize, services, helper, config });
    // eslint-disable-next-line prefer-destructuring
    getCommitDetail = commitDAL.getCommitDetail;
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
      await getCommitDetail({ uuid: '304ac260-7304-11e9-b42d-4d1ad7e5d420' });
    } catch (error) {
      assert(error instanceof NotFoundError);
    }
  });

  it('get commit', async () => {
    const {
      uuid,
      message: commitMessage,
      teamMemberId: authorId,
    } = (await sequelize.models.Commit.findAll())[0];
    const { uuid: commitUuid, message, teamMember } = await getCommitDetail({
      uuid,
    });
    assert.equal(uuid, commitUuid);
    assert.equal(message, commitMessage);
    assert.equal(teamMember.id, authorId);
  });
});
