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

const createUpdateCommentRoute = ({
  router,
  dal: {
    commitDAL: { updateComment },
  },
}) => {
  router.put(
    '/comment/:commentId',
    [
      check
        .param('commentId')
        .isInt()
        .toInt(),
      check
        .body('commentBody')
        .isString()
        .not()
        .isEmpty(),
      check
        .body('repositoryName')
        .isString()
        .not()
        .isEmpty(),
    ],
    validateInput,
    hasPermission(),
    toApiResponse(
      async ({
        params: { commentId },
        body: { commentBody, repositoryName },
        headers,
      }) => {
        try {
          const data = await updateComment(
            commentId,
            commentBody,
            repositoryName,
            headers['x-access-token'],
          );
          return {
            status: 200,
            data,
          };
        } catch (error) {
          if (error instanceof NotFoundError) {
            throw new ApiError({
              status: 404,
              code: notFoundErrorCode,
              message: 'comment not found!!',
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

module.exports = { createUpdateCommentRoute };
