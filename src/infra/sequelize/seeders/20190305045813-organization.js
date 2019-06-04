const organization = require('../data/organization.js');

module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert('Organization', organization, {}),
  down: queryInterface => queryInterface.bulkDelete('Organization', null, {}),
};
