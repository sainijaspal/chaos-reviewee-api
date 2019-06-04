const repository = require('../data/repository');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Repository', repository, {}),
  down: queryInterface => queryInterface.bulkDelete('Repository', null, {}),
};
