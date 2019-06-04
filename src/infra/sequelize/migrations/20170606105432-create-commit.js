module.exports = {
  up: (queryInterface, { UUID, UUIDV1, INTEGER, STRING, DATE, CHAR, TEXT }) =>
    queryInterface.createTable('Commit', {
      uuid: {
        primaryKey: true,
        defaultValue: UUIDV1,
        type: UUID,
      },
      sha: {
        type: CHAR(50),
        unique: true,
        allowNull: false,
      },
      shortSha: {
        type: CHAR(7),
        unique: true,
        allowNull: false,
      },
      message: {
        type: TEXT,
      },
      commitDate: {
        type: DATE,
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
      reviewerId: {
        type: INTEGER,
        references: {
          model: 'TeamMember',
          key: 'id',
        },
      },
      status: {
        type: INTEGER,
        defaultValue: 0,
      },
      parentSha: {
        type: STRING,
      },
      htmlUrl: {
        type: STRING,
      },
      commentsCount: {
        type: INTEGER,
        defaultValue: 0,
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
  down: queryInterface => queryInterface.dropTable('Commit'),
};
