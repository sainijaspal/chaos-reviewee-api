module.exports = require('../../src/infra/sequelize/data/technology.js').map(
  data => ({
    data,
    model: 'Technology',
  }),
);
