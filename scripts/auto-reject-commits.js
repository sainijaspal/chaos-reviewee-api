const {
  enums: { environment },
} = require('../src/application/helper/constants');
const { createHelper } = require('../src/application/helper/index');
const { createHttpRequest } = require('../src/application/base/index');
const { createSequelize } = require('../src/infra/sequelize/index');
const {
  createNotifications,
} = require('../src/application/notifications/index');
const { createServices } = require('../src/application/services/index');
const { createDAL } = require('../src/application/dal/index');
const { reportError } = require('../src/infra/report-error');
const config = require('../src/config.js');

(async () => {
  let sequelize;
  let services;
  let httpRequest;
  let helper;
  let notifications;

  const rejectedCommitsList = (commitList, baseURL) => {
    const rejectedCommits = [];
    commitList.forEach(item => {
      const objCommit = {};
      objCommit.message = item.commitMessage;
      const commitLink = `${baseURL}/commit?id=${item.repositoryId}&sha=${
        item.shortSha
      }&name=${item.repositoryName}`;
      objCommit.commitLink = commitLink;
      rejectedCommits.push(objCommit);
    });
    return rejectedCommits;
  };

  try {
    const currentDate = new Date();
    if (
      process.env.NODE_ENV === environment.Production &&
      currentDate.getDay() !== 0 &&
      currentDate.getDay() !== 6
    ) {
      httpRequest = createHttpRequest();
      helper = createHelper();
      sequelize = await createSequelize();
      services = createServices({ httpRequest, helper, config });
      notifications = createNotifications({ helper, config });
      const {
        commitDAL: { rejectCommitsAndSendNotification },
        collaboratorDAL: { getCollaborators },
      } = createDAL({ sequelize, services, helper, config });

      const {
        mailNotifications: { sendAutoRejectCommitEmail },
        slackNotifications: { sendSystemRejectedCommitsLink },
      } = notifications;
      const { baseURL } = config;
      let queryRunInterval = '48';
      if (currentDate.getDay() === 1) queryRunInterval = '72';

      const commits = await rejectCommitsAndSendNotification(queryRunInterval);

      if (commits) {
        const repositories = [
          ...new Set(commits.map(result => result.repositoryName)),
        ];
        repositories.forEach(async repositoryName => {
          const repository = commits.find(
            result => result.repositoryName === repositoryName,
          ); // get first result amount the multiple

          if (repository != null) {
            let rejectedCommits = commits.filter(
              item => item.repositoryName === repositoryName,
            );

            rejectedCommits = rejectedCommitsList(rejectedCommits, baseURL);
            const teamMembers = await getCollaborators(repository.repositoryId);

            const teamMembersEmail = teamMembers.map(
              result => result.teamMember.email,
            );
            await sendAutoRejectCommitEmail(
              repository.repositoryName,
              rejectedCommits,
              teamMembersEmail,
            );

            if (
              repository.channelName !== null &&
              repository.isNotificationsEnabled === true
            ) {
              await sendSystemRejectedCommitsLink(
                repository.repositoryName,
                repository.channelName,
                rejectedCommits,
              );
            }
          }
        });
      }
    }
  } catch (error) {
    reportError(error);
  } finally {
    await sequelize.close();
  }
})();
