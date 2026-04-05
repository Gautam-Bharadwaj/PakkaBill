class ApiError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }

  static isApiError(e) {
    return e && (e instanceof ApiError || e.name === 'ApiError');
  }

  static badRequest(msg, code) {
    return new ApiError(400, msg, code);
  }

  static unauthorized(msg) {
    return new ApiError(401, msg || 'Unauthorized');
  }

  static forbidden(msg) {
    return new ApiError(403, msg || 'Forbidden');
  }

  static notFound(msg) {
    return new ApiError(404, msg || 'Not found');
  }
}

module.exports = { ApiError };
