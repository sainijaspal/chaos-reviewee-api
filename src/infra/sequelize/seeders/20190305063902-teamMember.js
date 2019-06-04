const teamMember = require('../data/teamMember');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TeamMember', teamMember, {}),
  down: queryInterface => queryInterface.bulkDelete('TeamMember', null, {}),
};
