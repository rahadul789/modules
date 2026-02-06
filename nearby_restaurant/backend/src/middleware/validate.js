const Joi = require("joi");

// Validation schemas
const schemas = {
  getNearbyRestaurants: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(0.1).max(50).default(2),
    cuisine: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string()),
    ),
    priceRange: Joi.string().valid("$", "$$", "$$$", "$$$$"),
    minRating: Joi.number().min(0).max(5),
    limit: Joi.number().min(1).max(100).default(50),
    skip: Joi.number().min(0).default(0),
  }),

  getRestaurantById: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

// Middleware factory
const validate = (schemaName, source = "query") => {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      return res.status(500).json({
        success: false,
        message: "Validation schema not found",
      });
    }

    const dataToValidate =
      source === "params"
        ? req.params
        : source === "body"
          ? req.body
          : req.query;

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // Replace request data with validated and sanitized values
    if (source === "params") {
      req.params = value;
    } else if (source === "body") {
      req.body = value;
    } else {
      req.query = value;
    }

    next();
  };
};

module.exports = { validate, schemas };
