const { validationResult } = require('express-validator/check');
const {
  errorCodes: { validationErrorCode },
  ApiError,
} = require('./response.js');

const validateInput = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
    return;
  }

  throw new ApiError({
    code: validationErrorCode,
    details: errors.array(),
  });
};
module.exports = { validateInput };
