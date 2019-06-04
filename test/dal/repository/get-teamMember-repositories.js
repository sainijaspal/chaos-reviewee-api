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

const {
  enums: { projectType, repositoryPermission },
} = require('../../../src/application/helper/constants.js');

describe('#getTeamMemberRepositories', () => {
  let sequelize;
  let httpRequests;
  let helper;
  let services;
  let getRepositories;
  let insertRepository;
  let insertTeamMember;
  let TeamMemberRepository;

  before(async () => {
    /* eslint-disable prefer-destructuring */
    sequelize = await createSequelize();
    httpRequests = createHttpRequests();
    helper = createHelper();
    services = createServices({ httpRequests, helper, config });
    const { repositoryDAL, teamMemberDAL } = createDAL({
      sequelize,
      services,
      helper,
      config,
    });
    getRepositories = repositoryDAL.getRepositories;
    insertTeamMember = teamMemberDAL.insertTeamMember;
    insertRepository = repositoryDAL.insertRepository;
    TeamMemberRepository = sequelize.models.TeamMemberRepository;
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

  it('get the list of repositories associated to member', async () => {
    const {
      organizationId,
    } = (await sequelize.models.Organization.findAll())[0];
    const { id: teamMemberId } = await insertTeamMember({
      id: 17847559,
      login: 'jaspalucreate',
      name: 'Jaspal Singh',
      email: 'jaspal@ucreate.co.in',
    });
    await insertRepository({
      id: 166240689,
      name: 'reviewee-api',
      fullName: 'uCreateit/reviewee-api',
      channelName: 'review-tool',
      organizationId: 12858694,
      technologyId: 1,
    });
    await TeamMemberRepository.create({
      teamMemberId,
      repositoryId: 166240689,
      isReviewer: false,
      permission: repositoryPermission.Developer,
    });
    const result = await getRepositories(
      organizationId,
      teamMemberId,
      projectType.YourProjects,
      false,
    );
    assert.equal(result.length, 1);
  });
});
