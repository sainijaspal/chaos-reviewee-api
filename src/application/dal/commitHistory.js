const createCommitHistoryDAL = ({
  sequelize: {
    models: { CommitHistory, TeamMember },
  },
}) => {
  const insertCommitHistory = async body => CommitHistory.create(body);

  const getCommitHistory = async whereCondition =>
    CommitHistory.findAll({
      where: whereCondition,
      attributes: ['id', 'reviewerId'],
      include: [
        {
          model: TeamMember,
          as: 'reviewer',
          attributes: ['email'],
        },
      ],
    });

  const deleteCommitHistory = async item =>
    CommitHistory.destroy({
      where: item,
    });

  return {
    insertCommitHistory,
    getCommitHistory,
    deleteCommitHistory,
  };
};

module.exports = { createCommitHistoryDAL };
