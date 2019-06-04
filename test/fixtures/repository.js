module.exports = require('../../src/infra/sequelize/data/repository.js').map(
  data => ({
    data,
    model: 'Repository',
  }),
);
