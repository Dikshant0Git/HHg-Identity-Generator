/**
 * Standardized success response handler
 */
export const successResponse = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Standardized error response handler
 */
export const errorResponse = (res, code, message, statusCode = 400, details = null) => {
  const errorObj = {
    code,
    message,
  };
  if (details) {
    errorObj.details = details;
  }
  return res.status(statusCode).json({
    success: false,
    error: errorObj,
  });
};
