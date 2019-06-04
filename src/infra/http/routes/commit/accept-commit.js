const check = require('express-validator/check');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');
const {
  toApiResponse,
  ApiError,
  errorCodes: { notFoundErrorCode },
} = require('../../utils/response.js');
const { NotFoundError } = require('../../../../application/helper/errors.js');

const createAcceptCommitRoute = ({
  router,
  dal: {
    commitDAL: { acceptCommit },
  },
}) => {
  router.put(
    '/:commitId/accept',
    [check.param('commitId').isUUID()],
    validateInput,
    hasPermission(),
    toApiResponse(async ({ params: { commitId }, headers }) => {
      try {
        await acceptCommit(commitId, headers['x-key']);
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

module.exports = { createAcceptCommitRoute };
