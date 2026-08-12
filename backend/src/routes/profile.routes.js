import { Router } from "express";
import { getPublicProfile } from "../controllers/profile.controller.js";
import { publicProfileLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.get("/:publicId", publicProfileLimiter, getPublicProfile);

export default router;
