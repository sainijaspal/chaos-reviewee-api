const commit = require('../data/commit');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Commit', commit, {}),
  down: queryInterface => {
    queryInterface.bulkDelete('CommitHistory', null, {});
    queryInterface.bulkDelete('Notification', null, {});
    return queryInterface.bulkDelete('Commit', null, {});
  },
};
