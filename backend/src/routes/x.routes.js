import { Router } from "express";
import multer from "multer";
import { initiateAuth, handleCallback, shareCard } from "../controllers/x.controller.js";
import { xShareLimiter } from "../middleware/rateLimit.middleware.js";
import { X_IMAGE_LIMITS, X_ERROR_CODES } from "../constants/x.constants.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: X_IMAGE_LIMITS.MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (req, file, cb) => {
    if (X_IMAGE_LIMITS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error("Invalid image file type. Only PNG and JPEG are allowed.");
      err.code = X_ERROR_CODES.X_INVALID_IMAGE;
      err.statusCode = 400;
      cb(err);
    }
  },
});

const router = Router();

router.get("/auth", initiateAuth);
router.get("/callback", handleCallback);
router.post("/share", xShareLimiter, upload.single("card"), shareCard);

export default router;
