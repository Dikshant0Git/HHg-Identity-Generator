import { Router } from "express";
import multer from "multer";
import { createParticipant, getParticipant } from "../controllers/participant.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createParticipantSchema } from "../validators/participant.validator.js";
import { createParticipantLimiter } from "../middleware/rateLimit.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = Router();

router.post(
  "/",
  createParticipantLimiter,
  upload.single("photo"),
  validate(createParticipantSchema),
  createParticipant
);

router.get("/:publicId", getParticipant);

export default router;
