import { createOrGetParticipant, getParticipantByPublicId } from "../services/participant.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/**
 * POST /api/participants
 * Create or retrieve existing participant identity
 */
export const createParticipant = async (req, res, next) => {
  try {
    const result = await createOrGetParticipant(req.body, req.file);
    const statusCode = result.created ? 201 : 200;
    return successResponse(res, result, statusCode);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/participants/:publicId
 * Retrieve participant details by public ID
 */
export const getParticipant = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    if (!publicId || !publicId.startsWith("HH26-")) {
      return errorResponse(res, "INVALID_PUBLIC_ID", "Invalid public ID format. Expected HH26-XXXXXX", 400);
    }

    const participant = await getParticipantByPublicId(publicId);
    if (!participant) {
      return errorResponse(res, "PARTICIPANT_NOT_FOUND", "Participant not found.", 404);
    }

    return successResponse(res, { participant });
  } catch (error) {
    next(error);
  }
};
