class ApiResponse {
  constructor(statusCode, data, message = 'Success', pagination = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (pagination) this.pagination = pagination;
  }

  static success(res, data = null, message = 'Success', statusCode = 200, pagination = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, pagination));
  }

  static created(res, data = null, message = 'Created successfully') {
    return res.status(201).json(new ApiResponse(201, data, message));
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
