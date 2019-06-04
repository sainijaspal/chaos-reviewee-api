class AppError extends Error {
  constructor({ details = {}, message } = {}) {
    super(message || details.message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.details = details;
  }
}

class NotFoundError extends AppError {}
class UnprocessableEntityError extends AppError {}

module.exports = {
  AppError,
  NotFoundError,
  UnprocessableEntityError,
};
