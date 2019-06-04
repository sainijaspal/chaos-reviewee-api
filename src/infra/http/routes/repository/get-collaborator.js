const check = require('express-validator/check');
const { toApiResponse } = require('../../utils/response.js');
const { validateInput } = require('../../utils/validate-inputs.js');
const { hasPermission } = require('../../utils/authorization.js');

const createGetCollaboratorsRoute = ({
  router,
  dal: {
    collaboratorDAL: { getAllCollaborators },
  },
}) => {
  router.get(
    '/repository/:repositoryId/collaborators',
    [
      check
        .param('repositoryId')
        .isInt()
        .toInt(),
    ],
    validateInput,
    hasPermission(),
    toApiResponse(async ({ params: { repositoryId } }) => {
      const result = await getAllCollaborators(repositoryId);
      return {
        status: 200,
        data: result,
      };
    }),
  );

  return router;
};

module.exports = { createGetCollaboratorsRoute };
