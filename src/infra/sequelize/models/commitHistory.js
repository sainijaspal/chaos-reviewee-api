const createCommitHistoryModel = (sequelize, { UUID, INTEGER }) => {
  const CommitHistory = sequelize.define(
    'CommitHistory',
    {
      commitUuid: UUID,
      reviewerId: INTEGER,
      status: INTEGER,
    },
    {
      freezeTableName: true,
    },
  );

  CommitHistory.associate = function associate({ TeamMember, Commit }) {
    return Promise.all([
      CommitHistory.belongsTo(TeamMember, {
        foreignKey: { name: 'reviewerId' },
        targetKey: 'id',
        as: 'reviewer',
      }),
      CommitHistory.belongsTo(Commit, {
        foreignKey: { name: 'commitUuid' },
        targetKey: 'uuid',
        as: 'commit',
      }),
    ]);
  };
  return CommitHistory;
};

module.exports = { createCommitHistoryModel };
