const NodeSlackr = require('node-slackr');

const createSlackNotifications = ({ config: { baseURL, slackWebhookKey } }) => {
  const slackWebhook = new NodeSlackr(slackWebhookKey);

  /**
    @method sendBuildNotification
    Will be called when any build got success or fail (from Circle CI or Codeship);
    Some fields are different from both tool requests so we are get values as per request.
    ex: build.message || build.body
  */
  const sendBuildNotification = async (
    build,
    buildStatus,
    rejectedCount,
    commitMessage,
  ) => {
    let textMsg = ' ';
    const channels = [`#${build.channel_name}`];

    /* if build got succeeded and rejected count>0 then set rejected count to zero
        because sometime other user can reject when build was processing
    */
    if (
      build.status === 'success' &&
      rejectedCount > 0 &&
      buildStatus.toLowerCase() !== 'build succeeded (production)'
    ) {
      rejectedCount = 0; // eslint-disable-line no-param-reassign
    }

    let commitAuthor =
      build.committer_name || build.committer || build.committer_login;
    if (build.user && build.user.login) {
      commitAuthor = build.user.login;
    }

    const fields = [
      {
        title: buildStatus,
        value: `<${build.build_url}/|${commitMessage}>`,
        short: true,
      },
      {
        title: 'Author ',
        value: commitAuthor,
        short: true,
      },
      {
        title: 'Project ',
        value: build.project_name,
        short: true,
      },
    ];

    if (rejectedCount > 0) {
      // if deployment failed due to rejected commits
      fields.push({
        title: 'Rejected commits ',
        value: rejectedCount,
        short: true,
      });
      textMsg = `Deployment to _*${
        build.project_name
      }*_ stopped due to rejected commits.`;
      channels.push('#rejected-deployments');
    } else {
      fields.push({
        title: 'Branch ',
        value: build.branch,
        short: true,
      });
    }

    const messages = {
      channel: channels,
      attachments: [
        {
          text: textMsg,
          fallback:
            build.status === 'success' ? 'Build succeeded.' : 'Build failed.',
          color: build.status === 'success' ? '#36802D' : '#CB191F',
          mrkdwn_in: ['text'],
          fields,
        },
      ],
    };

    return new Promise((resolve, reject) => {
      slackWebhook.notify(messages, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  };

  const getRejectedCommitsLink = (repositoryName, rejectedCommits) => {
    let rejectedCommitsValue = '[';
    rejectedCommitsValue += `{"pretext": "<${baseURL}/|${repositoryName}> - List of rejected  commits: "},`;

    rejectedCommits.forEach(rejectedCommit => {
      rejectedCommitsValue += `{"title":"${
        rejectedCommit.message
      }","title_link" :"${rejectedCommit.commit_link}", '"color": "#F35A00"},`;
    });

    if (rejectedCommitsValue.length > 1) {
      rejectedCommitsValue = rejectedCommitsValue.substring(
        0,
        rejectedCommitsValue.length - 1,
      );
    }
    return `${rejectedCommitsValue}]`;
  };

  // send auto reject commit notification into slack
  const sendSystemRejectedCommitsLink = (
    repositoryName,
    channelName,
    rejectedCommits,
  ) => {
    const commitsLink = getRejectedCommitsLink(repositoryName, rejectedCommits);
    const messages = {
      channel: `#${channelName}`,
      attachments: JSON.parse(commitsLink),
    };
    return new Promise((resolve, reject) => {
      slackWebhook.notify(messages, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  };

  /*
    send amount of rejected, accepted and mark as fixed commits of current day
    and pending commits count that's need to be review notification
  */
  const sendCurrentReviewStatusReport = project => {
    const messages = {
      channel: `#${project.channel_name}`,
      attachments: [
        {
          text: `<${baseURL}/|${project.name}> - Commits Stats:`,
          fields: [
            {
              title: 'Approved commits: ',
              value: project.reviewed_count,
              short: true,
            },
            {
              title: 'Commits to be improved: ',
              value: project.rejected_count,
              short: true,
            },
            {
              title: 'Commits to be reviewed: ',
              value: project.pending_count,
              short: true,
            },
          ],
          color: project.rejected_count <= 0 ? '#36802D' : '#CB191F',
        },
      ],
    };
    return slackWebhook.notify(messages);
  };

  const sendRollbarErrorsNotifications = (
    repository,
    stagingResult,
    productionResult,
  ) => {
    const fields = [];
    if (stagingResult.success) {
      fields.push({
        title: 'Staging',
        value: stagingResult.error_count,
        short: true,
      });
    }

    if (productionResult.success) {
      fields.push({
        title: 'Production',
        value: productionResult.error_count,
        short: true,
      });
    }

    if (fields.length > 0) {
      const messages = {
        channel: `#${repository.channel_name}`,
        attachments: [
          {
            text: `<${baseURL}/|${repository.name}> - Rollbar active bugs.`,
            fields,
            color: '#F35A00',
          },
        ],
      };
      return new Promise((resolve, reject) => {
        slackWebhook.notify(messages, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
    }
    return false;
  };

  return {
    sendSystemRejectedCommitsLink,
    sendBuildNotification,
    sendCurrentReviewStatusReport,
    sendRollbarErrorsNotifications,
  };
};

module.exports = { createSlackNotifications };
