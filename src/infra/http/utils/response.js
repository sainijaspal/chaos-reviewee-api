const toApiResponse = fn => async (req, res, next) => {
  try {
    const { status, data, meta = null } = await fn(req, res);
    res.status(status).send({
      success: true,
      status,
      data,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

const errorCodes = {
  forbiddenErrorCode: 'forbiddenError',
  notFoundErrorCode: 'notFoundError',
  internalServerErrorCode: 'internalServerError',
  unprocessableEntityErrorCode: 'unprocessableEntity',
  invalidResetTokenErrorCode: 'invalidResetTokenError',
  unauthorizedErrorCode: 'unauthorizedError',
  invalidEmailErrorCode: 'invalidEmailError',
  tooManyRequestsErrorCode: 'tooManyRequestsError',
};

const errors = {
  [errorCodes.forbiddenErrorCode]: {
    status: 403,
    message: 'Not allowed to access the resource',
  },
  [errorCodes.notFoundErrorCode]: {
    status: 404,
    message: 'Resource not found',
  },
  [errorCodes.internalServerErrorCode]: {
    status: 500,
    message: 'Internal server error',
  },
  [errorCodes.validationErrorCode]: {
    status: 422,
    message: 'Unprocessable Entity',
  },
  [errorCodes.unauthorizedErrorCode]: {
    status: 401,
    message: 'Unauthorized',
  },
  [errorCodes.tooManyRequestsErrorCode]: {
    status: 429,
    message: 'Too many requests in this timeframe',
  },
};

class ApiError extends Error {
  constructor({ code, message, status, details }) {
    super();
    this.code = code;
    this.message = message || errors[code].message;
    this.status = status || errors[code].status;
    this.details = details || null;
    Error.captureStackTrace(this, ApiError);
  }
}

module.exports = { toApiResponse, ApiError, errorCodes };
