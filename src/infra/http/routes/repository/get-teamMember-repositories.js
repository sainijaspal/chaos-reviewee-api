const check = require('express-validator/check');
const { toApiResponse } = require('../../utils/response.js');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');

const createGetTeamMemberRepositoriesRoute = ({
  router,
  dal: {
    repositoryDAL: { getRepositories },
  },
}) => {
  router.get(
    '/organization/:organizationId/member/:teamMemberId/repositories',
    [
      check
        .param('organizationId')
        .isInt()
        .toInt(),
      check
        .param('teamMemberId')
        .isInt()
        .toInt(),
      check
        .query('type')
        .isInt()
        .toInt(),
      check
        .query('archive')
        .isBoolean()
        .toBoolean(),
    ],
    validateInput,
    hasPermission(),
    toApiResponse(
      async ({
        params: { organizationId, teamMemberId },
        query: { type, archive },
      }) => {
        const result = await getRepositories(
          organizationId,
          teamMemberId,
          type,
          archive,
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

module.exports = { createGetTeamMemberRepositoriesRoute };
