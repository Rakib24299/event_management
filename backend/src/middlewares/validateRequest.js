const { ZodError } = require("zod");
const Joi = require("joi");

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const isZodSchema = typeof schema.parseAsync === "function";

      if (isZodSchema) {
        await schema.parseAsync({
          body: req.body,
          params: req.params,
          query: req.query,
        });
      } else if (typeof schema.validateAsync === "function") {
        await schema.validateAsync(req.body, { abortEarly: false });
      } else {
        return res.status(500).json({
          success: false,
          message: "Invalid validation schema.",
        });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError || error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: (error.issues || error.errors || []).map((err) => ({
            field: (err.path || []).slice(1).join(".") || err.path,
            message: err.message,
          })),
        });
      }

      if (error instanceof Error && error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: (error.details || []).map((err) => ({
            field: err.path?.join(".") || err.path,
            message: err.message,
          })),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
};

module.exports = validateRequest;