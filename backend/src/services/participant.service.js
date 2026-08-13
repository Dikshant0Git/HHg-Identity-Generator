import { Participant } from "../models/participant.model.js";
import { generateUniquePublicId } from "./id.service.js";
import { generateBuilderClass } from "./builderClass.service.js";
import { config } from "../config/env.js";
import { imagekitService } from "./imagekit.service.js";
import { validateParticipantPhoto } from "../utils/participantImageValidator.js";

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
    photoFileId: obj.photoFileId || "",
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
export const createOrGetParticipant = async (input, file = null) => {
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
  const stackArray = Array.isArray(input.stack)
    ? input.stack.map((item) => String(item).trim())
    : typeof input.stack === "string"
    ? input.stack.split(",").map((s) => s.trim())
    : [];

  const builderClass = generateBuilderClass(stackArray);
  const publicId = await generateUniquePublicId();

  let finalPhotoUrl = input.photoUrl ? input.photoUrl.trim() : "";
  let finalPhotoFileId = "";
  let uploadedToImageKit = false;

  // 3. Upload photo buffer to ImageKit if file is present
  if (file && file.buffer) {
    const validation = validateParticipantPhoto(file);
    if (!validation.isValid) {
      throw {
        statusCode: 400,
        code: validation.code,
        message: validation.message,
      };
    }

    const ext = file.mimetype === "image/png" ? "png" : file.mimetype === "image/webp" ? "webp" : "jpg";
    const fileName = `${publicId}.${ext}`;

    const uploadRes = await imagekitService.uploadParticipantPhoto({
      fileBuffer: file.buffer,
      fileName,
      folder: "hh-goa-2026/participants",
    });

    finalPhotoUrl = uploadRes.photoUrl;
    finalPhotoFileId = uploadRes.photoFileId;
    uploadedToImageKit = true;
  }

  if (!finalPhotoUrl) {
    throw {
      statusCode: 400,
      code: "IMAGE_REQUIRED",
      message: "Participant photograph is required.",
    };
  }

  // 4. Save participant to MongoDB
  try {
    const participant = await Participant.create({
      identityKey,
      email: identityKey,
      publicId,
      name: input.name.trim(),
      photoUrl: finalPhotoUrl,
      photoFileId: finalPhotoFileId,
      stack: stackArray,
      builderClass,
      social: {
        xHandle: input.social?.xHandle?.trim() || input.xHandle?.trim() || "",
        github: input.social?.github?.trim() || input.github?.trim() || "",
        linkedin: input.social?.linkedin?.trim() || input.linkedin?.trim() || "",
        bio: input.social?.bio?.trim() || input.bio?.trim() || "",
      },
    });

    return {
      created: true,
      existing: false,
      participant: formatParticipantResponse(participant),
    };
  } catch (error) {
    // Clean up uploaded ImageKit asset if database save fails
    if (uploadedToImageKit && finalPhotoFileId) {
      await imagekitService.deleteAsset(finalPhotoFileId);
    }

    // Handle MongoDB unique constraint race conditions (code 11000)
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
