const Sequelize = require('sequelize');
const {
  enums: { repositoryRoles },
} = require('../helper/constants');

const { Op } = Sequelize;

const createCollaboratorDAL = ({
  sequelize: {
    models: { TeamMemberRepository, TeamMember },
  },
}) => {
  const getAllCollaborators = async repositoryId =>
    TeamMemberRepository.findAll({
      where: {
        repositoryId,
      },
      attributes: ['teamMemberId', 'permission'],
      include: [
        {
          model: TeamMember,
          attributes: ['login', 'avatarUrl', 'name', 'email'],
          as: 'teamMember',
        },
      ],
      order: [['teamMember', 'login', 'ASC']],
    });

  const addCollaborator = async (
    teamMemberId,
    isAdmin,
    createdBy,
    repositoryId,
  ) => {
    const permission =
      isAdmin === false ? repositoryRoles.Developer : repositoryRoles.Admin;
    const item = {
      teamMemberId,
      repositoryId,
      isActive: true,
      createdBy,
      isReviewer: false,
      permission,
    };
    return TeamMemberRepository.findOrCreate({
      where: {
        teamMemberId,
        repositoryId,
      },
      attributes: [
        'id',
        'teamMemberId',
        'repositoryId',
        'createdBy',
        'permission',
      ],
      defaults: item,
    });
  };

  const removeCollaborator = async item =>
    TeamMemberRepository.destroy({
      where: item,
    });

  const updateMemberRepositoryRole = async (role, id) => {
    const isReviewer = role === repositoryRoles.Reviewer;
    return TeamMemberRepository.update(
      { permission: role, isReviewer },
      {
        where: {
          id,
        },
      },
    );
  };

  const getCollaborators = async repositoryId =>
    TeamMemberRepository.findAll({
      where: {
        repositoryId,
        permission: {
          [Op.in]: [repositoryRoles.Developer, repositoryRoles.Reviewer],
        },
      },
      attributes: ['teamMemberId', 'isReviewer'],
      include: [
        {
          model: TeamMember,
          attributes: ['id', 'login', 'avatarUrl', 'email'],
          required: true,
          where: { isDailyEmailEnabled: true },
        },
      ],
    });

  return {
    getAllCollaborators,
    addCollaborator,
    removeCollaborator,
    updateMemberRepositoryRole,
    getCollaborators,
  };
};

module.exports = { createCollaboratorDAL };
