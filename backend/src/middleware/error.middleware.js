const { ApiError } = require('../utils/ApiError');

function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (ApiError.isApiError(err) || err.statusCode) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ success: false, error: 'Internal server error' });
}

module.exports = { errorMiddleware };
