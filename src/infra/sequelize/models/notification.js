const createNotificationModel = (sequelize, { INTEGER, STRING, BOOLEAN }) => {
  const Notification = sequelize.define(
    'Notification',
    {
      repositoryId: INTEGER,
      commitUuid: INTEGER,
      senderId: INTEGER,
      recipientId: INTEGER,
      type: STRING,
      read: BOOLEAN,
    },
    {
      freezeTableName: true,
    },
  );

  Notification.associate = function associate({
    TeamMember,
    Repository,
    Commit,
  }) {
    return Promise.all([
      Notification.belongsTo(Repository, {
        as: 'repository',
        foreignKey: { name: 'repositoryId' },
        targetKey: 'id',
      }),
      Notification.belongsTo(Commit, {
        as: 'commit',
        foreignKey: { name: 'commitUuid' },
        targetKey: 'uuid',
      }),
      Notification.belongsTo(TeamMember, {
        foreignKey: { name: 'senderId' },
        targetKey: 'id',
        as: 'sender',
      }),
      Notification.belongsTo(TeamMember, {
        foreignKey: { name: 'recipientId' },
        targetKey: 'id',
        as: 'recipient',
      }),
    ]);
  };
  return Notification;
};

module.exports = { createNotificationModel };
