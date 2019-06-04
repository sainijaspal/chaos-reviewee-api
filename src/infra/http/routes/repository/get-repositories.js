const check = require('express-validator/check');
const { toApiResponse } = require('../../utils/response.js');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');

const createGetRepositoriesRoute = ({
  router,
  dal: {
    repositoryDAL: { getAllRepositories },
  },
}) => {
  router.get(
    '/organization/:organizationId/repositories',
    [
      check
        .param('organizationId')
        .isInt()
        .toInt(),
    ],
    validateInput,
    hasPermission(),
    toApiResponse(async ({ params: { organizationId } }) => {
      const result = await getAllRepositories(organizationId);
      return {
        status: 200,
        data: result,
      };
    }),
  );

  return router;
};

module.exports = { createGetRepositoriesRoute };
