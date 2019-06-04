const check = require('express-validator/check');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');
const {
  toApiResponse,
  ApiError,
  errorCodes: { notFoundErrorCode, unprocessableEntityErrorCode },
} = require('../../utils/response.js');
const {
  NotFoundError,
  UnprocessableEntityError,
} = require('../../../../application/helper/errors.js');

const createSaveCommentRoute = ({
  router,
  dal: {
    commitDAL: { saveComment },
    teamMemberDAL: { getMembersEmails, getTeamMemberById },
  },
  notifications: {
    mailNotifications: { sendCommitCommentEmail },
  },
}) => {
  router.post(
    '/:sha/comment',
    [
      check
        .param('sha')
        .isString()
        .not()
        .isEmpty(),
      check
        .body('commentBody')
        .isString()
        .not()
        .isEmpty(),
    ],
    validateInput,
    hasPermission(),
    toApiResponse(
      async ({
        params: { sha },
        body: { commentBody, path, position },
        headers,
      }) => {
        try {
          const [result, commenterDetail] = await Promise.all([
            saveComment(
              sha,
              commentBody,
              position,
              path,
              headers['x-key'],
              headers['x-access-token'],
            ),
            getTeamMemberById({ id: headers['x-key'] }),
          ]);
          const { commit } = result;
          const { membersComments } = result;
          getMembersEmails(membersComments).then(teamMemberEmails => {
            if (teamMemberEmails != null) {
              sendCommitCommentEmail(
                commenterDetail.login,
                commentBody,
                commit.message,
                sha,
                commit.repositoryId,
                commit.repository.name,
                teamMemberEmails,
              );
            }
          });

          delete result.commit;
          delete result.membersComments;
          return {
            status: 200,
            data: result,
          };
        } catch (error) {
          if (error instanceof NotFoundError) {
            throw new ApiError({
              status: 404,
              code: notFoundErrorCode,
              message: 'commit not found!!',
            });
          }
          if (error instanceof UnprocessableEntityError) {
            throw new ApiError({
              status: 422,
              code: unprocessableEntityErrorCode,
              message: 'validation error!!',
            });
          }
          throw error;
        }
      },
    ),
  );

  return router;
};

module.exports = { createSaveCommentRoute };
