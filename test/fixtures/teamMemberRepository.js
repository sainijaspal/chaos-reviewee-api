module.exports = require('../../src/infra/sequelize/data/teamMemberRepository.js').map(
  data => ({
    data,
    model: 'TeamMemberRepository',
  }),
);
