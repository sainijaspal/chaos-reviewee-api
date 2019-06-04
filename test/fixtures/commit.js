module.exports = require('../../src/infra/sequelize/data/commit.js').map(
  data => ({
    data,
    model: 'Commit',
  }),
);
