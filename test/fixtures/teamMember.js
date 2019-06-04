module.exports = require('../../src/infra/sequelize/data/teamMember.js').map(
  data => ({
    data,
    model: 'TeamMember',
  }),
);
