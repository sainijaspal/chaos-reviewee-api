const createTechnologyModel = (sequelize, { STRING, BOOLEAN }) => {
  const Technology = sequelize.define(
    'Technology',
    {
      name: STRING,
      channelName: STRING,
      icon: STRING,
      isActive: BOOLEAN,
    },
    {
      freezeTableName: true,
    },
  );
  return Technology;
};

module.exports = { createTechnologyModel };
