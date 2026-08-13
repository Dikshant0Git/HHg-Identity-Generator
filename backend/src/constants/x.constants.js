/**
 * Fixed X Post Caption — Backend Controlled (Mandatory Requirement)
 * Do not make this user-editable or allow client overrides.
 */
export const X_POST_CAPTION = "Just forged my HH Goa 2026 ID 🌴\n#FrameInGoa";

/**
 * X API Error Codes for standardized client responses
 */
export const X_ERROR_CODES = {
  X_AUTH_REQUIRED: "X_AUTH_REQUIRED",
  X_AUTH_DENIED: "X_AUTH_DENIED",
  X_INVALID_STATE: "X_INVALID_STATE",
  X_TOKEN_EXPIRED: "X_TOKEN_EXPIRED",
  X_TOKEN_REFRESH_FAILED: "X_TOKEN_REFRESH_FAILED",
  X_INSUFFICIENT_PERMISSIONS: "X_INSUFFICIENT_PERMISSIONS",
  X_IMAGE_REQUIRED: "X_IMAGE_REQUIRED",
  X_INVALID_IMAGE: "X_INVALID_IMAGE",
  X_IMAGE_TOO_LARGE: "X_IMAGE_TOO_LARGE",
  X_MEDIA_UPLOAD_FAILED: "X_MEDIA_UPLOAD_FAILED",
  X_POST_FAILED: "X_POST_FAILED",
  X_RATE_LIMITED: "X_RATE_LIMITED",
  X_API_UNAVAILABLE: "X_API_UNAVAILABLE",
  X_REQUEST_TIMEOUT: "X_REQUEST_TIMEOUT",
  X_DUPLICATE_SHARE: "X_DUPLICATE_SHARE",
};

/**
 * Image constraint limits
 */
export const X_IMAGE_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB limit
  ALLOWED_MIME_TYPES: ["image/png", "image/jpeg"],
};
