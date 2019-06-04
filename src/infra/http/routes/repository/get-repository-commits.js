const check = require('express-validator/check');
const { toApiResponse } = require('../../utils/response.js');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');

const createGetRepositoryCommitsRoute = ({
  router,
  dal: {
    commitDAL: { getCommits },
  },
}) => {
  router.get(
    '/repository/:repositoryId/commits',
    [
      check
        .param('repositoryId')
        .isInt()
        .toInt(),
    ],
    validateInput,
    hasPermission(),
    toApiResponse(
      async ({
        params: { repositoryId },
        query: { offset, status, MembersFilter },
        headers,
      }) => {
        const result = await getCommits(
          repositoryId,
          headers['x-key'],
          offset,
          status,
          MembersFilter,
        );
        return {
          status: 200,
          data: result,
        };
      },
    ),
  );

  return router;
};

module.exports = { createGetRepositoryCommitsRoute };
