import { generateBuilderClass } from "../services/builderClass.service.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * POST /api/builder-class/preview
 * Optional endpoint to preview builder class before submission
 */
export const previewBuilderClass = async (req, res, next) => {
  try {
    const { stack } = req.body;
    const builderClass = generateBuilderClass(Array.isArray(stack) ? stack : []);
    return successResponse(res, { builderClass });
  } catch (error) {
    next(error);
  }
};
