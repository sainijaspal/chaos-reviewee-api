module.exports = {
  up: (queryInterface, { INTEGER, BOOLEAN, DATE }) =>
    queryInterface.createTable('TeamMemberRepositoryState', {
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
      teamMemberId: {
        type: INTEGER,
        references: {
          model: 'TeamMember',
          key: 'id',
        },
      },
      isCurrent: {
        type: BOOLEAN,
        defaultValue: false,
      },
      isFavourite: {
        type: BOOLEAN,
      },
      isReviewerRepositorySection: {
        type: BOOLEAN,
      },
      isArchived: {
        type: BOOLEAN,
        defaultValue: false,
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
  down: queryInterface => queryInterface.dropTable('TeamMemberRepositoryState'),
};
