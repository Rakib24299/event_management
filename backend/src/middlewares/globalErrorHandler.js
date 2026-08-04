const AppError = require("../utils/AppError");

const globalErrorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  
  // Mongoose Invalid ObjectId
  
  if (error.name === "CastError") {
    err = new AppError(
      `Resource not found. Invalid ID: ${error.value}`,
      404
    );
  }

  
  // Duplicate Key Error
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];

    err = new AppError(
      `${field} already exists.`,
      409
    );
  }

  
  // Validation Error
  
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");

    err = new AppError(message, 400);
  }

  
  // JWT Invalid
  
  if (error.name === "JsonWebTokenError") {
    err = new AppError(
      "Invalid authentication token.",
      401
    );
  }

 
  // JWT Expired
  
  if (error.name === "TokenExpiredError") {
    err = new AppError(
      "Authentication token has expired.",
      401
    );
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",

    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};

module.exports = globalErrorHandler;