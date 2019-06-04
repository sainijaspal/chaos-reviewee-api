const { createCommonHelper } = require('./common');

const createHelper = () => {
  const commonHelper = createCommonHelper();

  return {
    commonHelper,
  };
};

module.exports = { createHelper };
