const Sequelize = require('sequelize');
const { createOrganizationModel } = require('./models/organization');
const { createTeamMemberModel } = require('./models/teamMember');
const { createTechnologyModel } = require('./models/technology');
const { createRepositoryModel } = require('./models/repository');
const {
  createTeamMemberRepositoryModel,
} = require('./models/teamMemberRepository');
const {
  createTeamMemberRepositoryStateModel,
} = require('./models/teamMemberRepositoryState');
const { createCommitModel } = require('./models/commit');
const { createCommitHistoryModel } = require('./models/commitHistory');
const { createNotificationModel } = require('./models/notification');
const { config } = require('./config.js');

const createSequelize = async ({
  url,
  sync,
  logging,
  operatorsAliases,
  ssl,
  dialectOptions,
} = config) => {
  // create transactions namespace
  // const namespace = createNamespace('reviewee-api-transactions');
  // Sequelize.useCLS(namespace);

  // initialize the connection
  const sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging,
    operatorsAliases,
    ssl,
    dialectOptions,
  });

  // create models
  const Organization = createOrganizationModel(sequelize, Sequelize);
  const TeamMember = createTeamMemberModel(sequelize, Sequelize);
  const Technology = createTechnologyModel(sequelize, Sequelize);
  const Repository = createRepositoryModel(sequelize, Sequelize);
  const TeamMemberRepository = createTeamMemberRepositoryModel(
    sequelize,
    Sequelize,
  );
  const TeamMemberRepositoryState = createTeamMemberRepositoryStateModel(
    sequelize,
    Sequelize,
  );
  const Commit = createCommitModel(sequelize, Sequelize);
  const CommitHistory = createCommitHistoryModel(sequelize, Sequelize);
  const Notification = createNotificationModel(sequelize, Sequelize);

  const models = {
    Organization,
    TeamMember,
    Technology,
    Repository,
    TeamMemberRepository,
    TeamMemberRepositoryState,
    Commit,
    CommitHistory,
    Notification,
  };

  // associate models
  Object.values(models).forEach(model => {
    if (typeof model.associate !== 'function') {
      return;
    }
    model.associate(models);
  });

  if (sync) {
    await sequelize.sync({ force: true });
  }

  return {
    db: sequelize,
    models,
    close: () => sequelize.connectionManager.close(),
    truncate: async () => {
      await Promise.all(
        Object.values(models).map(model => model.truncate({ cascade: true })),
      );
    },
  };
};

module.exports = {
  createSequelize,
};
