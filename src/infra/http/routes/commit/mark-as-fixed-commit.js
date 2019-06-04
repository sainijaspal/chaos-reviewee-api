const check = require('express-validator/check');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');
const {
  toApiResponse,
  ApiError,
  errorCodes: { notFoundErrorCode },
} = require('../../utils/response.js');
const { NotFoundError } = require('../../../../application/helper/errors.js');

const createMarkAsFixedCommitRoute = ({
  router,
  dal: {
    commitDAL: { markAsFixedCommit },
  },
}) => {
  router.put(
    '/:commitUUID/markAsFixed',
    [check.param('commitUUID').isUUID()],
    validateInput,
    hasPermission(),
    toApiResponse(async ({ params: { commitUUID }, headers }) => {
      try {
        await markAsFixedCommit(commitUUID, headers['x-key']);
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

module.exports = { createMarkAsFixedCommitRoute };
