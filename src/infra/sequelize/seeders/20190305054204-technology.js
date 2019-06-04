const technology = require('../data/technology');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Technology', technology, {}),
  down: queryInterface => queryInterface.bulkDelete('Technology', null, {}),
};
