module.exports = require('../../src/infra/sequelize/data/organization.js').map(
  data => ({
    data,
    model: 'Organization',
  }),
);
