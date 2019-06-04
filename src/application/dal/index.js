const { createCommitDAL } = require('./commits');
const { createProfileDAL } = require('./profile');
const { createNotificationDAL } = require('./notifications');
const { createOrganizationDAL } = require('./organizations');
const { createRepositoryDAL } = require('./repositories');
const { createCollaboratorDAL } = require('./collaborators');
const { createTeamMemberDAL } = require('./teamMembers');
const { createCommitHistoryDAL } = require('./commitHistory');

const createDAL = ({ sequelize, services, helper, config }) => {
  const teamMemberDAL = createTeamMemberDAL({
    sequelize,
    services,
    helper,
    config,
  });
  const notificationDAL = createNotificationDAL({ sequelize });
  const commitHistoryDAL = createCommitHistoryDAL({ sequelize });
  const commitDAL = createCommitDAL({
    sequelize,
    services,
    helper,
    config,
    teamMemberDAL,
    notificationDAL,
    commitHistoryDAL,
  });
  const profileDAL = createProfileDAL({ sequelize, services });
  const organizationDAL = createOrganizationDAL({ sequelize });
  const repositoryDAL = createRepositoryDAL({ sequelize, helper });
  const collaboratorDAL = createCollaboratorDAL({ sequelize });

  return {
    commitDAL,
    profileDAL,
    notificationDAL,
    organizationDAL,
    repositoryDAL,
    collaboratorDAL,
    teamMemberDAL,
    commitHistoryDAL,
  };
};

module.exports = { createDAL };
