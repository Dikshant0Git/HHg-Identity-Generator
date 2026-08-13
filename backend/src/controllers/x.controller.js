import { xService } from "../services/x.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { config } from "../config/env.js";
import { X_ERROR_CODES } from "../constants/x.constants.js";

/**
 * GET /api/x/auth — Initiate X OAuth 2.0 PKCE flow
 */
export const initiateAuth = (req, res, next) => {
  try {
    const { authUrl, state } = xService.getAuthUrl();

    // Store state in HTTP-only cookie or header for session tracking
    res.cookie("x_oauth_state", state, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    if (req.headers.accept?.includes("text/html") || req.query.redirect === "true") {
      return res.redirect(authUrl);
    }

    return successResponse(res, { authUrl, state });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/x/callback — OAuth 2.0 Authorization Callback
 */
export const handleCallback = async (req, res, next) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError || !code || !state) {
      const redirectUrl = `${config.frontendUrl}/create?x_error=${X_ERROR_CODES.X_AUTH_DENIED}`;
      return res.redirect(redirectUrl);
    }

    const { sessionKey } = await xService.handleCallback(code, state);

    res.cookie("x_session", sessionKey, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${config.frontendUrl}/create?x_auth=success`);
  } catch (error) {
    const errorCode = error.code || X_ERROR_CODES.X_AUTH_DENIED;
    return res.redirect(`${config.frontendUrl}/create?x_error=${errorCode}`);
  }
};

/**
 * POST /api/x/share — Upload generated ID card PNG & publish post with FIXED HH Goa caption
 */
export const shareCard = async (req, res, next) => {
  try {
    const file = req.file;

    // Explicitly ignore any caption provided by the frontend/client
    // The backend owns the fixed caption (X_POST_CAPTION)

    const sessionKey = req.cookies?.x_session || req.headers["x-session-key"] || "default_session";

    const result = await xService.shareCard({
      file,
      sessionKey,
    });

    return successResponse(res, result, 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || "X_SHARE_FAILED";
    const message = error.message || "Failed to share card to X.";
    return errorResponse(res, errorCode, message, statusCode);
  }
};
