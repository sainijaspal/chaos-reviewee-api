const check = require('express-validator/check');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');
const {
  toApiResponse,
  ApiError,
  errorCodes: { notFoundErrorCode },
} = require('../../utils/response.js');
const {
  enums: { commitStatus },
} = require('../../../../application/helper/constants');
const { NotFoundError } = require('../../../../application/helper/errors.js');

const createRejectCommitRoute = ({
  router,
  dal: {
    commitDAL: { rejectCommit, getCommitDetail },
    commitHistoryDAL: { getCommitHistory },
    teamMemberDAL: { getTeamMemberById },
  },
  services: {
    githubServices: { getCommitComments },
  },
  notifications: {
    mailNotifications: { sendRejectedMail },
  },
}) => {
  router.put(
    '/:commitUUID/reject',
    [check.param('commitUUID').isUUID()],
    validateInput,
    hasPermission(),
    toApiResponse(async ({ params: { commitUUID }, headers }) => {
      try {
        const [
          ,
          {
            sha,
            shortSha,
            message: commitMessage,
            repositoryId,
            status: currentCommitStatus,
            teamMember: { login: authorLogin, email: authorEmail },
            repository: { fullName: repositoryFullName, name: repositoryName },
          },
          { login: reviewerLogin },
        ] = await Promise.all([
          rejectCommit(commitUUID, headers['x-key']),
          getCommitDetail({ uuid: commitUUID }), // get commit, author, repository details
          getTeamMemberById({ id: headers['x-key'] }), // get details of reviewer
        ]);

        let comments = null;
        let oldReviewerEmails;
        let commitHistoryDetail;
        if (currentCommitStatus === commitStatus.Accepted) {
          [comments, commitHistoryDetail] = await Promise.all([
            getCommitComments(
              repositoryFullName,
              headers['x-access-token'],
              sha.trim(),
            ),
            getCommitHistory({ commitUuid: commitUUID }),
          ]);
          oldReviewerEmails = [
            ...new Set(commitHistoryDetail.map(x => x.reviewer.email)),
          ];
        }

        sendRejectedMail(
          reviewerLogin,
          authorEmail,
          authorLogin,
          commitMessage,
          repositoryName,
          repositoryId,
          shortSha,
          sha.trim(),
          currentCommitStatus,
          oldReviewerEmails,
          comments,
        );

        return {
          status: 204,
        };
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new ApiError({
            status: 404,
            code: notFoundErrorCode,
            message: 'commit not found!!',
          });
        }
        throw error;
      }
    }),
  );

  return router;
};

module.exports = { createRejectCommitRoute };
