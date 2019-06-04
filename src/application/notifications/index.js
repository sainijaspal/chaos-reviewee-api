const { createMailNotifications } = require('./mail');
const { createSlackNotifications } = require('./slack');

const createNotifications = ({ helper, config }) => {
  const mailNotifications = createMailNotifications({ helper, config });
  const slackNotifications = createSlackNotifications({ config });

  return {
    mailNotifications,
    slackNotifications,
  };
};

module.exports = { createNotifications };
