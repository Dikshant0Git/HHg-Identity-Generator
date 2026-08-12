import { Router } from "express";
import { createParticipant, getParticipant } from "../controllers/participant.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createParticipantSchema } from "../validators/participant.validator.js";
import { createParticipantLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/", createParticipantLimiter, validate(createParticipantSchema), createParticipant);
router.get("/:publicId", getParticipant);

export default router;
