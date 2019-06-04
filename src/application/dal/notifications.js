const {
  enums: { notificationType },
} = require('../helper/constants');

const createNotificationDAL = ({
  sequelize: {
    models: { Notification, TeamMember, Repository, Commit },
  },
}) => {
  const getNotificationsInsertItems = (
    commentByMembers,
    repositoryId,
    commitUuid,
    type,
    senderId,
  ) => {
    const notificationItems = [];
    commentByMembers.forEach(recipientId => {
      const item = {
        repositoryId,
        commitUuid,
        senderId,
        recipientId,
        type,
        read: false,
      };
      notificationItems.push(item);
    });
    return notificationItems;
  };

  const insertNotifications = async (
    type,
    repositoryId,
    commitUuid,
    authorId,
    commentByMembers,
    senderId,
  ) => {
    let notificationItems = [];
    if (type === notificationType.Comment) {
      notificationItems = getNotificationsInsertItems(
        commentByMembers,
        repositoryId,
        commitUuid,
        type,
        senderId,
      );
    } else {
      notificationItems.push({
        repositoryId,
        commitUuid,
        senderId,
        authorId,
        type,
        read: false,
      });
    }
    Notification.bulkCreate(notificationItems);
  };

  const updateReadNotifications = async recipientId =>
    Notification.update(
      { read: true },
      {
        where: { recipientId },
      },
    );

  const getNotificationsForTeamMember = async (
    first20Notifications,
    lastNotificationId,
    recipientId,
  ) => {
    let whrCondition;
    if (first20Notifications === false) {
      whrCondition = {
        recipientId,
        id: {
          $lt: lastNotificationId,
        },
        senderId: {
          $ne: recipientId,
        },
      };
    } else {
      whrCondition = {
        recipientId,
        senderId: {
          $ne: recipientId,
        },
      };
    }
    const item = {
      where: whrCondition,
      attributes: [
        'id',
        'repositoryId',
        'senderId',
        'recipientId',
        'type',
        'createdAt',
      ],
      limit: 20,
      order: 'id DESC',
      include: [
        {
          model: TeamMember,
          as: 'sender',
          attributes: ['name', 'login', 'avatarUrl', 'email'],
        },
        {
          model: TeamMember,
          as: 'recipient',
          attributes: ['name', 'login', 'avatarUrl', 'email'],
          required: true,
        },
        {
          model: Repository,
          attributes: ['name', 'fullName'],
          required: true,
        },
        {
          model: Commit,
          attributes: ['sha', 'shortSha', 'message'],
          required: true,
        },
      ],
    };

    return Notification.findAll(item);
  };

  const getUnReadNotifications = async recipientId =>
    Notification.findAll({
      where: {
        recipientId,
        read: false,
      },
      attributes: ['repositoryId', 'senderId', 'recipientId', 'type'],
      order: 'id DESC',
    });

  const deleteNotifications = async item =>
    Notification.destroy({
      where: item,
    });

  return {
    insertNotifications,
    updateReadNotifications,
    getNotificationsForTeamMember,
    getUnReadNotifications,
    deleteNotifications,
  };
};

module.exports = { createNotificationDAL };
