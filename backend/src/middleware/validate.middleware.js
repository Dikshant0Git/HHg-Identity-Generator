import { errorResponse } from "../utils/apiResponse.js";

/**
 * Express middleware to validate request body against a Zod schema
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error.errors) {
      const issueMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return errorResponse(res, "VALIDATION_ERROR", issueMessages, 400, error.errors);
    }
    return errorResponse(res, "VALIDATION_ERROR", error.message || "Invalid request payload", 400);
  }
};
