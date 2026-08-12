import { Participant } from "../models/participant.model.js";

/**
 * Sanitizes a participant document for public viewing
 * Strips private identity fields: email, identityKey, _id, __v
 */
export const sanitizePublicProfile = (participant) => {
  if (!participant) return null;

  const obj = participant.toObject ? participant.toObject() : participant;

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
  };
};

/**
 * Retrieves public profile by publicId and increments profileViews counter
 */
export const getPublicProfileByPublicId = async (publicId) => {
  const participant = await Participant.findOneAndUpdate(
    { publicId },
    { $inc: { profileViews: 1 } },
    { new: true }
  );

  if (!participant) {
    return null;
  }

  return sanitizePublicProfile(participant);
};
