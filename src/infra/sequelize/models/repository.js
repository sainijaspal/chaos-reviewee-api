const createRepositoryModel = (sequelize, { INTEGER, STRING, BOOLEAN }) => {
  const Repository = sequelize.define(
    'Repository',
    {
      name: STRING,
      fullName: STRING,
      organizationId: INTEGER,
      technologyId: INTEGER,
      channelName: STRING,
      uatToken: STRING,
      productionToken: STRING,
      isNotificationsEnabled: BOOLEAN,
      isForcefullDeploymentEnabled: BOOLEAN,
      isRollbarNotificationEnabled: BOOLEAN,
      isEmailNotificationEnabled: BOOLEAN,
      isArchived: BOOLEAN,
      isActive: BOOLEAN,
    },
    {
      freezeTableName: true,
    },
  );

  Repository.associate = function associate({ Organization, Technology }) {
    return Promise.all([
      Repository.belongsTo(Organization, {
        foreignKey: { name: 'organizationId' },
        targetKey: 'organizationId',
        as: 'organization',
      }),
      Repository.belongsTo(Technology, {
        as: 'technology',
        foreignKey: { name: 'technologyId' },
        targetKey: 'id',
      }),
    ]);
  };

  return Repository;
};

module.exports = { createRepositoryModel };
