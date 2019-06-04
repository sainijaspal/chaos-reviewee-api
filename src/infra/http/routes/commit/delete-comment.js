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

const createDeleteCommentRoute = ({
  router,
  dal: {
    commitDAL: { deleteComment },
  },
}) => {
  router.delete(
    '/:sha/comment/:commentId',
    [
      check
        .param('commentId')
        .isInt()
        .toInt(),
      check
        .param('sha')
        .isString()
        .not()
        .isEmpty()
        .isLength({ min: 35, max: 45 }),
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
        params: { commentId, sha },
        body: { repositoryName },
        headers,
      }) => {
        try {
          await deleteComment(
            commentId,
            sha,
            repositoryName,
            headers['x-access-token'],
          );
          return {
            status: 204,
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

module.exports = { createDeleteCommentRoute };
