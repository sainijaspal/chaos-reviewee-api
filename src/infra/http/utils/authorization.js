const {
  ApiError,
  errorCodes: { forbiddenErrorCode, unauthorizedErrorCode },
} = require('./response.js');
const { validateUser } = require('../../../application/services/login');

const hasPermission = () => async (req, res, next) => {
  const token = req.headers['x-access-token'];
  const key = req.headers['x-key'];

  if (token) {
    try {
      validateUser(token, (err, user) => {
        if (!err && user && user.id.toString() === key) {
          return next();
        }
        return next(
          new ApiError({
            code: forbiddenErrorCode,
          }),
        );
      });
    } catch (error) {
      next(error);
    }
  } else {
    next(
      new ApiError({
        code: unauthorizedErrorCode,
      }),
    );
  }
};

module.exports = { hasPermission };
