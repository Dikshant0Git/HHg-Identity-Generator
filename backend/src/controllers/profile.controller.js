import { getPublicProfileByPublicId } from "../services/profile.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/**
 * GET /api/profiles/:publicId
 * Fetch public verification profile for QR code routing
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId || !publicId.startsWith("HH26-")) {
      return errorResponse(res, "INVALID_PUBLIC_ID", "Invalid public ID format. Expected HH26-XXXXXX", 400);
    }

    const profile = await getPublicProfileByPublicId(publicId);

    if (!profile) {
      return errorResponse(res, "PARTICIPANT_NOT_FOUND", "Participant not found.", 404);
    }

    return successResponse(res, { participant: profile });
  } catch (error) {
    next(error);
  }
};
