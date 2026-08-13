import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";
import { X_ERROR_CODES } from "../constants/x.constants.js";

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

/**
 * Strict rate limiter for X card sharing (POST /api/x/share)
 */
export const xShareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 share posts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: X_ERROR_CODES.X_RATE_LIMITED,
        message: "Share rate limit reached. Please wait before posting again.",
      },
    });
  },
});
