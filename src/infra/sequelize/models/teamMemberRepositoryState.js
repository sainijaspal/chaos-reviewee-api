const createTeamMemberRepositoryStateModel = (
  sequelize,
  { INTEGER, BOOLEAN },
) => {
  const TeamMemberRepositoryState = sequelize.define(
    'TeamMemberRepositoryState',
    {
      repositoryId: INTEGER,
      teamMemberId: INTEGER,
      isCurrent: BOOLEAN,
      isFavourite: BOOLEAN,
      isReviewerRepositorySection: BOOLEAN,
      isArchived: BOOLEAN,
    },
    {
      freezeTableName: true,
    },
  );

  TeamMemberRepositoryState.associate = function associate({
    TeamMember,
    Repository,
  }) {
    return Promise.all([
      TeamMemberRepositoryState.belongsTo(TeamMember, {
        foreignKey: { name: 'teamMemberId' },
        targetKey: 'id',
        as: 'teamMember',
      }),
      TeamMemberRepositoryState.belongsTo(Repository, {
        as: 'repository',
        foreignKey: { name: 'repositoryId' },
        targetKey: 'id',
      }),
    ]);
  };

  return TeamMemberRepositoryState;
};

module.exports = { createTeamMemberRepositoryStateModel };
