const { Router } = require('express');
const { createGetCommitRoute } = require('./get-commit');
const { createAcceptCommitRoute } = require('./accept-commit');
const { createRejectCommitRoute } = require('./reject-commit');
const { createMarkAsFixedCommitRoute } = require('./mark-as-fixed-commit');
const { createSaveCommentRoute } = require('./save-comment');
const { createUpdateCommentRoute } = require('./update-comment');
const { createDeleteCommentRoute } = require('./delete-comment');

const createCommitRoute = ({ dal, services, notifications }) => {
  const router = new Router();

  createGetCommitRoute({ router, dal });
  createAcceptCommitRoute({ router, dal });
  createRejectCommitRoute({ router, dal, services, notifications });
  createMarkAsFixedCommitRoute({ router, dal });
  createSaveCommentRoute({ router, dal, notifications });
  createUpdateCommentRoute({ router, dal });
  createDeleteCommentRoute({ router, dal });

  return router;
};

module.exports = { createCommitRoute };
