import { X_IMAGE_LIMITS, X_ERROR_CODES } from "../constants/x.constants.js";

/**
 * Validates uploaded card image buffer against PNG/JPEG specifications and size constraints.
 */
export function validateCardImage(file) {
  if (!file || !file.buffer) {
    return {
      isValid: false,
      code: X_ERROR_CODES.X_IMAGE_REQUIRED,
      message: "No image file provided in the card field.",
    };
  }

  const { buffer, mimetype, size } = file;

  if (size > X_IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      code: X_ERROR_CODES.X_IMAGE_TOO_LARGE,
      message: `Image size exceeds the maximum limit of ${X_IMAGE_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  if (!X_IMAGE_LIMITS.ALLOWED_MIME_TYPES.includes(mimetype)) {
    return {
      isValid: false,
      code: X_ERROR_CODES.X_INVALID_IMAGE,
      message: "Invalid image MIME type. Only PNG and JPEG formats are supported.",
    };
  }

  // Validate file signature / magic numbers
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  if (!isPng && !isJpeg) {
    return {
      isValid: false,
      code: X_ERROR_CODES.X_INVALID_IMAGE,
      message: "Invalid image binary structure.",
    };
  }

  return { isValid: true };
}
