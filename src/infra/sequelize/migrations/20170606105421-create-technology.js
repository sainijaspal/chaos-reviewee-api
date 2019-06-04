module.exports = {
  up: (queryInterface, { INTEGER, STRING, BOOLEAN, DATE }) =>
    queryInterface.createTable('Technology', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: INTEGER,
      },
      name: {
        type: STRING,
      },
      channelName: {
        type: STRING,
      },
      icon: {
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
  down: queryInterface => queryInterface.dropTable('Technology'),
};
