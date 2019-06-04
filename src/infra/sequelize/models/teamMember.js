const createTeamMemberModel = (sequelize, { STRING, BOOLEAN }) => {
  const TeamMember = sequelize.define(
    'TeamMember',
    {
      login: STRING,
      name: STRING,
      email: STRING,
      avatarUrl: STRING,
      isActive: BOOLEAN,
      isDailyEmailEnabled: BOOLEAN,
      isCommitCommentEmailEnabled: BOOLEAN,
    },
    {
      freezeTableName: true,
    },
  );
  return TeamMember;
};

module.exports = { createTeamMemberModel };
