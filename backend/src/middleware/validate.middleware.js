const validate = (source) => (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map((detail) => detail.message),
    });
  }
  req[source] = value;
  return next();
};

const validateBody = validate('body');
const validateQuery = validate('query');

module.exports = { validateBody, validateQuery };
