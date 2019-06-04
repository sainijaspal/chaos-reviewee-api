const { Router } = require('express');
const { createGetRepositoriesRoute } = require('./get-repositories');
const { createGetRepositoryCommitsRoute } = require('./get-repository-commits');
const {
  createGetTeamMemberRepositoriesRoute,
} = require('./get-teamMember-repositories');
const { createGetCollaboratorsRoute } = require('./get-collaborator');

const createRepositoryRoute = ({ dal }) => {
  const router = new Router();

  createGetRepositoriesRoute({ router, dal });
  createGetRepositoryCommitsRoute({ router, dal });
  createGetTeamMemberRepositoriesRoute({ router, dal });
  createGetCollaboratorsRoute({ router, dal });

  return router;
};

module.exports = { createRepositoryRoute };
