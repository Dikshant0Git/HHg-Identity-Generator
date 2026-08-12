import { Participant } from "../models/participant.model.js";
import { generateUniquePublicId } from "./id.service.js";
import { generateBuilderClass } from "./builderClass.service.js";
import { config } from "../config/env.js";

/**
 * Normalizes email address for identityKey
 */
const normalizeEmail = (email) => {
  return String(email).trim().toLowerCase();
};

/**
 * Format participant object with public URLs for frontend response
 */
export const formatParticipantResponse = (participant) => {
  const obj = participant.toObject ? participant.toObject() : participant;
  const profileUrl = `${config.publicBaseUrl}/id/${obj.publicId}`;

  return {
    publicId: obj.publicId,
    name: obj.name,
    photoUrl: obj.photoUrl,
    stack: obj.stack,
    builderClass: obj.builderClass,
    social: {
      xHandle: obj.social?.xHandle || "",
      github: obj.social?.github || "",
      linkedin: obj.social?.linkedin || "",
      bio: obj.social?.bio || "",
    },
    status: obj.status || "active",
    profileUrl,
    qrPayload: profileUrl,
  };
};

/**
 * Create a new participant or return existing participant if email matches identityKey
 */
export const createOrGetParticipant = async (input) => {
  const identityKey = normalizeEmail(input.email);

  // 1. Check for existing participant by identityKey
  const existing = await Participant.findOne({ identityKey });
  if (existing) {
    return {
      created: false,
      existing: true,
      participant: formatParticipantResponse(existing),
    };
  }

  // 2. Generate deterministic builder class & unique publicId
  const builderClass = generateBuilderClass(input.stack);
  const publicId = await generateUniquePublicId();

  try {
    const participant = await Participant.create({
      identityKey,
      email: identityKey,
      publicId,
      name: input.name.trim(),
      photoUrl: input.photoUrl.trim(),
      stack: input.stack.map((item) => String(item).trim()),
      builderClass,
      social: {
        xHandle: input.social?.xHandle?.trim() || "",
        github: input.social?.github?.trim() || "",
        linkedin: input.social?.linkedin?.trim() || "",
        bio: input.social?.bio?.trim() || "",
      },
    });

    return {
      created: true,
      existing: false,
      participant: formatParticipantResponse(participant),
    };
  } catch (error) {
    // 3. Handle MongoDB unique constraint race conditions (code 11000)
    if (error.code === 11000 || error.name === "MongoServerError") {
      const raceExisting = await Participant.findOne({ identityKey });
      if (raceExisting) {
        return {
          created: false,
          existing: true,
          participant: formatParticipantResponse(raceExisting),
        };
      }
    }
    throw error;
  }
};

/**
 * Fetch participant by public ID
 */
export const getParticipantByPublicId = async (publicId) => {
  const participant = await Participant.findOne({ publicId });
  if (!participant) return null;
  return formatParticipantResponse(participant);
};
