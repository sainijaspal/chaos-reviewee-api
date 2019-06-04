const createOrganizationModel = (sequelize, { INTEGER, STRING, BOOLEAN }) => {
  const Organization = sequelize.define(
    'Organization',
    {
      organizationId: {
        type: INTEGER,
        primaryKey: true,
      },
      name: STRING,
      email: STRING,
      description: STRING,
      company: STRING,
      avatarUrl: STRING,
      webhookSecret: STRING,
      webhookPath: STRING,
      isActive: BOOLEAN,
    },
    {
      freezeTableName: true,
    },
  );

  return Organization;
};

module.exports = { createOrganizationModel };
