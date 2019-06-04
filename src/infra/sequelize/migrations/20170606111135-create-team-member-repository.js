module.exports = {
  up: (queryInterface, { INTEGER, BOOLEAN, DATE }) =>
    queryInterface.createTable('TeamMemberRepository', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: INTEGER,
      },
      teamMemberId: {
        type: INTEGER,
        references: {
          model: 'TeamMember',
          key: 'id',
        },
      },
      repositoryId: {
        type: INTEGER,
        references: {
          model: 'Repository',
          key: 'id',
        },
      },
      isReviewer: {
        type: BOOLEAN,
        defaultValue: false,
      },
      permission: {
        type: INTEGER,
      },
      createdBy: {
        type: INTEGER,
        allowNull: true,
        references: {
          model: 'TeamMember',
          key: 'id',
        },
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
  down: queryInterface => queryInterface.dropTable('TeamMemberRepository'),
};
