const createTeamMemberRepositoryModel = (sequelize, { INTEGER, BOOLEAN }) => {
  const TeamMemberRepository = sequelize.define(
    'TeamMemberRepository',
    {
      teamMemberId: INTEGER,
      repositoryId: INTEGER,
      isReviewer: BOOLEAN,
      permission: INTEGER,
      createdBy: INTEGER,
      isActive: BOOLEAN,
    },
    {
      freezeTableName: true,
    },
  );

  TeamMemberRepository.associate = function associate({
    TeamMember,
    Repository,
  }) {
    return Promise.all([
      TeamMemberRepository.belongsTo(TeamMember, {
        foreignKey: { name: 'teamMemberId' },
        targetKey: 'id',
        as: 'teamMember',
      }),
      TeamMemberRepository.belongsTo(TeamMember, {
        foreignKey: { name: 'createdBy' },
        targetKey: 'id',
        as: 'creator',
      }),
      TeamMemberRepository.belongsTo(Repository, {
        as: 'repository',
        foreignKey: { name: 'repositoryId' },
        targetKey: 'id',
      }),
    ]);
  };
  return TeamMemberRepository;
};

module.exports = { createTeamMemberRepositoryModel };
