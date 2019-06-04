const { Op } = require('sequelize');

const createTeamMemberDAL = ({
  sequelize: {
    models: { TeamMember },
    db,
  },
  services: {
    githubServices: { getUserInfo, updateMember },
  },
  helper: {
    commonHelper: { qryGetTeamMembersAssociatedToRepo, exceptionHandler },
  },
  config: { webhookSecretKey },
}) => {
  const insertTeamMember = async item => {
    const [data, created] = await TeamMember.findOrCreate({
      where: {
        id: item.id,
      },
      attributes: ['login'],
      defaults: item,
      returning: true,
    });
    if (created) {
      return data;
    }
    const member = {
      name: item.name,
      email: item.email,
      avatarUrl: item.avatar_url,
      isActive: true,
    };
    return TeamMember.update(member, {
      where: {
        id: item.id,
      },
    });
  };

  const updateTeamMember = async (body, id) => {
    return TeamMember.update(body, {
      where: {
        id,
      },
    });
  };

  const getAllTeamMembers = async () => {
    const items = await TeamMember.findAll({
      where: {
        is_active: true,
      },
      attributes: ['login'],
      order: 'id',
    });
    return {
      data: items.filter(item => item.login != null).map(item => item.login),
    };
  };

  const getTeamMemberById = async condition =>
    TeamMember.findOne({
      where: condition,
      attributes: [
        'id',
        'name',
        'login',
        'email',
        'avatarUrl',
        'isDailyEmailEnabled',
        'isCommitCommentEmailEnabled',
      ],
    });

  const updateMemberDetail = async (
    email,
    name,
    login,
    isDailyEmailEnabled,
    isCommitCommentEmailEnabled,
    user,
  ) => {
    await TeamMember.update(
      {
        email,
        name,
        isDailyEmailEnabled,
        isCommitCommentEmailEnabled,
      },
      {
        where: {
          login,
        },
      },
    );
    user.email = email; // eslint-disable-line no-param-reassign
    user.name = name; // eslint-disable-line no-param-reassign
    return {
      status: 200,
      data: {
        success: true,
        message: `${login} details updated.`,
      },
    };
  };

  const updateTeamMemberdetails = exceptionHandler(
    async ({
      body: {
        verifyEmail,
        login,
        email,
        name,
        isDailyEmailEnabled,
        isCommitCommentEmailEnabled,
      },
      session: { user },
    }) => {
      if (verifyEmail === true) {
        const userInfo = await getUserInfo(webhookSecretKey, login);
        if (userInfo) {
          if (userInfo.email == null) {
            return {
              status: 200,
              data: {
                success: false,
                privacy: 'private',
                message: `${login} email address not found, please make it public.`,
              },
            };
          }
          if (userInfo.email !== email) {
            return {
              status: 200,
              data: {
                success: false,
                message: `${login} email address must be same as used in github.`,
              },
            };
          }
          await updateMember(name, user.token);
          return updateMemberDetail(
            email,
            name,
            login,
            isDailyEmailEnabled,
            isCommitCommentEmailEnabled,
            user,
          );
        }
      } else {
        return updateMemberDetail(
          email,
          name,
          login,
          isDailyEmailEnabled,
          isCommitCommentEmailEnabled,
          user,
        );
      }
      return false;
    },
  );

  const getMembersEmails = async membersId => {
    const members = await TeamMember.findAll({
      where: {
        id: {
          [Op.in]: membersId,
        },
        email: {
          [Op.ne]: null,
        },
        isCommitCommentEmailEnabled: true,
      },
      attributes: ['email'],
    });
    return members.map(x => x.email);
  };

  const getTeamMembersAssociatedRepo = async () => {
    const qryGetTeamMemberAssociatedToRepo = qryGetTeamMembersAssociatedToRepo();
    return db.query(qryGetTeamMemberAssociatedToRepo);
  };

  const deleteTeamMember = async id => {
    return TeamMember.destroy({
      where: {
        id,
      },
    });
  };

  return {
    insertTeamMember,
    getAllTeamMembers,
    getTeamMemberById,
    updateTeamMemberdetails,
    updateTeamMember,
    getMembersEmails,
    getTeamMembersAssociatedRepo,
    deleteTeamMember,
  };
};

module.exports = { createTeamMemberDAL };
