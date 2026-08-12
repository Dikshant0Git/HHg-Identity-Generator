import crypto from "crypto";
import { Participant } from "../models/participant.model.js";

const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generates a random 6-character uppercase alphanumeric string
 */
const generateRandomSuffix = (length = 6) => {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
  }
  return result;
};

/**
 * Generates a unique public ID (HH26-XXXXXX) with collision checking
 */
export const generateUniquePublicId = async () => {
  const maxRetries = 10;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidateId = `HH26-${generateRandomSuffix(6)}`;
    const existing = await Participant.findOne({ publicId: candidateId });
    if (!existing) {
      return candidateId;
    }
  }
  throw new Error("Unable to generate unique Public ID after maximum retry attempts");
};
