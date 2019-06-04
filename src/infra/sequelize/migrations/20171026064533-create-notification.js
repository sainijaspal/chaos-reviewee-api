module.exports = {
  up: (queryInterface, { INTEGER, STRING, BOOLEAN, DATE, UUID }) =>
    queryInterface.createTable('Notification', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: INTEGER,
      },
      repositoryId: {
        type: INTEGER,
        references: {
          model: 'Repository',
          key: 'id',
        },
      },
      commitUuid: {
        type: UUID,
        references: {
          model: 'Commit',
          key: 'uuid',
        },
      },
      senderId: {
        type: INTEGER,
        references: {
          model: 'TeamMember',
          key: 'id',
        },
      },
      recipientId: {
        type: INTEGER,
        references: {
          model: 'TeamMember',
          key: 'id',
        },
      },
      type: {
        type: STRING,
      },
      read: {
        type: BOOLEAN,
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
  down: queryInterface => queryInterface.dropTable('Notification'),
};
