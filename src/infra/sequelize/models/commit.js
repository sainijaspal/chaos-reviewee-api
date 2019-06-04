const createCommitModel = (
  sequelize,
  { UUID, UUIDV1, CHAR, INTEGER, DATE, TEXT, STRING },
) => {
  const Commit = sequelize.define(
    'Commit',
    {
      uuid: {
        type: UUID,
        defaultValue: UUIDV1,
        primaryKey: true,
      },
      sha: CHAR(50),
      shortSha: CHAR(7),
      message: TEXT,
      commitDate: DATE,
      repositoryId: INTEGER,
      teamMemberId: INTEGER,
      reviewerId: INTEGER,
      status: INTEGER,
      htmlUrl: STRING,
      parentSha: STRING,
      commentsCount: INTEGER,
    },
    {
      freezeTableName: true,
    },
  );

  Commit.associate = function associate({
    TeamMember,
    Repository,
    CommitHistory,
  }) {
    return Promise.all([
      Commit.belongsTo(Repository, {
        foreignKey: { name: 'repositoryId' },
        targetKey: 'id',
        as: 'repository',
      }),
      Commit.belongsTo(TeamMember, {
        foreignKey: { name: 'teamMemberId' },
        targetKey: 'id',
        as: 'teamMember',
      }),
      Commit.belongsTo(TeamMember, {
        foreignKey: { name: 'reviewerId' },
        targetKey: 'id',
        as: 'reviewer',
      }),
      Commit.hasMany(CommitHistory, {
        foreignKey: { name: 'commitUuid' },
        targetKey: 'uuid',
        as: 'commitHistories',
      }),
    ]);
  };
  return Commit;
};

module.exports = { createCommitModel };
