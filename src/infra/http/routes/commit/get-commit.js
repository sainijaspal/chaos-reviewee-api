const check = require('express-validator/check');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');
const {
  toApiResponse,
  ApiError,
  errorCodes: { notFoundErrorCode },
} = require('../../utils/response.js');
const { NotFoundError } = require('../../../../application/helper/errors.js');

const createGetCommitRoute = ({
  router,
  dal: {
    commitDAL: { getCommitDetail, getGithubCommitDetail },
  },
}) => {
  router.get(
    '/:uuid',
    [
      check.param('uuid').isUUID(),
      check
        .query('sha')
        .isString()
        .not()
        .isEmpty()
        .isLength({ min: 35, max: 45 }),
      check
        .query('teamMemberId')
        .isInt()
        .toInt(),
      check
        .query('repositoryFullName')
        .isString()
        .not()
        .isEmpty(),
    ],
    validateInput,
    hasPermission(),
    toApiResponse(
      async ({
        params: { uuid },
        query: { sha, teamMemberId, repositoryFullName },
        headers,
      }) => {
        try {
          const [commitDetail, gitCommitDetail] = await Promise.all([
            getCommitDetail({ uuid }),
            getGithubCommitDetail(
              repositoryFullName,
              sha,
              headers['x-access-token'],
              teamMemberId,
            ),
          ]);

          const merged = {
            commitDetails: {
              ...commitDetail,
              ...gitCommitDetail.commitDetail,
            },
          };

          return {
            status: 200,
            data: {
              commitDetails: merged.commitDetails,
              files: gitCommitDetail.files,
            },
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
      },
    ),
  );

  return router;
};

module.exports = { createGetCommitRoute };
