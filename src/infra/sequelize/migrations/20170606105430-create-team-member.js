module.exports = {
  up: (queryInterface, { INTEGER, STRING, BOOLEAN, DATE }) =>
    queryInterface.createTable('TeamMember', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: INTEGER,
      },
      login: {
        type: STRING,
      },
      name: {
        type: STRING,
      },
      email: {
        type: STRING,
      },
      avatarUrl: {
        type: STRING,
      },
      isActive: {
        type: BOOLEAN,
        defaultValue: true,
      },
      isDailyEmailEnabled: {
        type: BOOLEAN,
        defaultValue: true,
      },
      isCommitCommentEmailEnabled: {
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
  down: queryInterface => queryInterface.dropTable('TeamMember'),
};
