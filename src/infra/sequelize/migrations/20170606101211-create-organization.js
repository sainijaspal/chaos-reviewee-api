module.exports = {
  up: (queryInterface, { INTEGER, STRING, BOOLEAN, DATE }) =>
    queryInterface.createTable('Organization', {
      organizationId: {
        allowNull: false,
        primaryKey: true,
        type: INTEGER,
      },
      name: {
        allowNull: false,
        type: STRING,
      },
      email: {
        type: STRING,
      },
      description: {
        type: STRING,
      },
      company: {
        type: STRING,
      },
      webhookSecret: {
        type: STRING,
      },
      webhookPath: {
        type: STRING,
      },
      avatarUrl: {
        type: STRING,
      },
      isActive: {
        type: BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DATE,
      },
    }),
  down: queryInterface => queryInterface.dropTable('Organization'),
};
