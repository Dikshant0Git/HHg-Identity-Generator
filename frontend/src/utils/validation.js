/**
 * Frontend validation helpers — mirrors backend Zod rules.
 * Use for client-side pre-validation before API calls.
 */

export const VALIDATION_RULES = {
  email: { maxLength: 254 },
  name: { minLength: 1, maxLength: 80 },
  photoUrl: { maxLength: 2000 },
  stack: { minItems: 1, maxItems: 8, itemMaxLength: 30 },
  social: {
    xHandle: { maxLength: 50 },
    github: { maxLength: 150 },
    linkedin: { maxLength: 150 },
    bio: { maxLength: 280 },
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  if (email.length > VALIDATION_RULES.email.maxLength) return 'Email is too long';
  return null;
};

export const validateName = (name) => {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length > VALIDATION_RULES.name.maxLength) return 'Name cannot exceed 80 characters';
  return null;
};

export const validatePhotoUrl = (url) => {
  if (!url) return 'Photo is required';
  if (url.length > VALIDATION_RULES.photoUrl.maxLength) return 'Photo URL is too long';
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return 'Photo URL must be HTTP or HTTPS';
  } catch {
    return 'Invalid photo URL';
  }
  return null;
};

export const validateStack = (stack) => {
  if (!Array.isArray(stack) || stack.length === 0) return 'At least 1 technology is required';
  if (stack.length > VALIDATION_RULES.stack.maxItems) return 'Maximum 8 technologies';
  for (const item of stack) {
    if (item.length > VALIDATION_RULES.stack.itemMaxLength) return `"${item}" exceeds 30 characters`;
  }
  return null;
};

export const validateParticipantForm = (formData) => {
  const errors = {};
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  const photoError = validatePhotoUrl(formData.photoUrl);
  if (photoError) errors.photoUrl = photoError;

  const stackError = validateStack(formData.stack);
  if (stackError) errors.stack = stackError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
