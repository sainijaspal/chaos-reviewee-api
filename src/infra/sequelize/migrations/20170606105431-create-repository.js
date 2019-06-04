module.exports = {
  up: (queryInterface, { INTEGER, STRING, BOOLEAN, DATE }) =>
    queryInterface.createTable('Repository', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: INTEGER,
      },
      name: {
        type: STRING,
      },
      fullName: {
        type: STRING,
      },
      channelName: {
        type: STRING,
      },
      organizationId: {
        allowNull: false,
        type: INTEGER,
        references: {
          model: 'Organization',
          key: 'organizationId',
        },
      },
      technologyId: {
        allowNull: true,
        type: INTEGER,
        references: {
          model: 'Technology',
          key: 'id',
        },
      },
      uatToken: {
        type: STRING,
      },
      productionToken: {
        type: STRING,
      },
      isRollbarNotificationEnabled: {
        type: BOOLEAN,
        defaultValue: false,
      },
      isNotificationsEnabled: {
        type: BOOLEAN,
        defaultValue: false,
      },
      isEmailNotificationEnabled: {
        type: BOOLEAN,
        defaultValue: false,
      },
      isForcefullDeploymentEnabled: {
        type: BOOLEAN,
        defaultValue: false,
      },
      isArchived: {
        type: BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DATE,
      },
    }),
  down: queryInterface => queryInterface.dropTable('Repository'),
};
