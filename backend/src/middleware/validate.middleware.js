const { z } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * PATTERN: Middleware factory
 * Returns an Express middleware that validates req body/params/query against a Zod schema.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(ApiError.badRequest('Validation failed', errors));
      }
      next(err);
    }
  };
};

module.exports = validate;
