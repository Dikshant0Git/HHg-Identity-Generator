/**
 * Validates participant profile photograph buffer format, magic bytes, and size.
 */
export function validateParticipantPhoto(file) {
  if (!file || !file.buffer) {
    return {
      isValid: false,
      code: "IMAGE_REQUIRED",
      message: "Photograph file is required.",
    };
  }

  const { buffer, mimetype, size } = file;

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (size > MAX_SIZE) {
    return {
      isValid: false,
      code: "IMAGE_TOO_LARGE",
      message: "Image size exceeds maximum limit of 5MB.",
    };
  }

  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (mimetype && !allowedMimes.includes(mimetype)) {
    return {
      isValid: false,
      code: "IMAGE_TYPE_NOT_SUPPORTED",
      message: "Unsupported image format. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      code: "IMAGE_INVALID",
      message: "Uploaded image file is empty.",
    };
  }

  // Validate magic bytes
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isWebp =
    buffer.length >= 12 &&
    buffer[0] === 0x52 && // 'R'
    buffer[1] === 0x49 && // 'I'
    buffer[2] === 0x46 && // 'F'
    buffer[3] === 0x46 && // 'F'
    buffer[8] === 0x57 && // 'W'
    buffer[9] === 0x45 && // 'E'
    buffer[10] === 0x42 && // 'B'
    buffer[11] === 0x50; // 'P'

  if (!isPng && !isJpeg && !isWebp) {
    return {
      isValid: false,
      code: "IMAGE_INVALID",
      message: "Invalid image binary header.",
    };
  }

  return { isValid: true };
}
