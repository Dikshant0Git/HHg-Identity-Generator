import { errorResponse } from "../utils/apiResponse.js";
import { config } from "../config/env.js";

/**
 * 404 Not Found handler middleware for unknown routes
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, "NOT_FOUND", `Cannot ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global Express error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || (statusCode === 404 ? "NOT_FOUND" : "INTERNAL_ERROR");
  const message =
    config.env === "production" && statusCode === 500
      ? "An internal server error occurred"
      : err.message || "Internal server error";

  return errorResponse(res, code, message, statusCode);
};
