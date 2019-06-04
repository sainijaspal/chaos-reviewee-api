const teamMemberRepository = require('../data/teamMemberRepository');

module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert('TeamMemberRepository', teamMemberRepository, {}),
  down: queryInterface =>
    queryInterface.bulkDelete('TeamMemberRepository', null, {}),
};
