import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

/**
 * Rate limiter for participant creation (POST /api/participants)
 */
export const createParticipantLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests from this IP. Please try again later.",
      },
    });
  },
});

/**
 * Generous rate limiter for public profile access (GET /api/profiles/:publicId)
 */
export const publicProfileLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many profile views requested. Please slow down.",
      },
    });
  },
});
