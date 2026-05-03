/**
 * Custom API Error class
 * Use this to throw structured errors from controllers.
 * Example: throw new ApiError(404, "Employee not found")
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
