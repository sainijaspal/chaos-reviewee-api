module.exports = {
  up: (queryInterface, { INTEGER, UUID, DATE }) =>
    queryInterface.createTable('CommitHistory', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: INTEGER,
      },
      commitUuid: {
        type: UUID,
        references: {
          model: 'Commit',
          key: 'uuid',
        },
      },
      reviewerId: {
        type: INTEGER,
        references: {
          model: 'TeamMember',
          key: 'id',
        },
      },
      status: {
        type: INTEGER,
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
  down: queryInterface => queryInterface.dropTable('CommitHistory'),
};
