const createProfileDAL = ({
  sequelize: {
    models: { TeamMember },
  },
  services: {
    githubServices: { updateMember },
  },
}) => {
  const updateProfile = async ({
    body,
    session: {
      user: { id, token },
    },
  }) => {
    await updateMember(body.name, token);
    return TeamMember.update(body, {
      where: {
        id,
      },
    });
  };
  return updateProfile;
};

module.exports = { createProfileDAL };
