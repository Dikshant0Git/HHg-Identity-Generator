import { config } from "../config/env.js";
import { X_POST_CAPTION, X_ERROR_CODES } from "../constants/x.constants.js";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "../utils/pkce.js";
import { tokenStore } from "../utils/tokenStore.js";
import { validateCardImage } from "../utils/imageValidator.js";

export class XService {
  /**
   * Generate X OAuth 2.0 Authorization URL with PKCE
   */
  getAuthUrl() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    tokenStore.saveState(state, codeVerifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.x.clientId,
      redirect_uri: config.x.redirectUri,
      scope: config.x.scopes,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return {
      authUrl: `${config.x.apiBaseUrl}/2/oauth2/authorize?${params.toString()}`,
      state,
    };
  }

  /**
   * Handle OAuth Callback — Exchange authorization code for access & refresh tokens
   */
  async handleCallback(code, state) {
    const storedState = tokenStore.getAndRemoveState(state);
    if (!storedState) {
      throw {
        statusCode: 400,
        code: X_ERROR_CODES.X_INVALID_STATE,
        message: "Invalid or expired OAuth state parameter.",
      };
    }

    const { codeVerifier } = storedState;

    const body = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: config.x.clientId,
      redirect_uri: config.x.redirectUri,
      code_verifier: codeVerifier,
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (config.x.clientSecret) {
      const authHeader = Buffer.from(`${config.x.clientId}:${config.x.clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${authHeader}`;
    }

    try {
      const response = await fetch(`${config.x.apiBaseUrl}/2/oauth2/token`, {
        method: "POST",
        headers,
        body: body.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          statusCode: response.status,
          code: X_ERROR_CODES.X_AUTH_DENIED,
          message: data.error_description || data.error || "Failed to exchange authorization code.",
        };
      }

      const sessionKey = state; // store using state or default key
      tokenStore.saveTokens(sessionKey, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      });

      return { sessionKey };
    } catch (error) {
      if (error.code) throw error;
      throw {
        statusCode: 500,
        code: X_ERROR_CODES.X_AUTH_DENIED,
        message: error.message || "Failed to complete X OAuth authentication.",
      };
    }
  }

  /**
   * Refresh expired X Access Token server-side
   */
  async refreshAccessToken(sessionKey) {
    const tokens = tokenStore.getTokens(sessionKey);
    if (!tokens || !tokens.refreshToken) {
      throw {
        statusCode: 401,
        code: X_ERROR_CODES.X_AUTH_REQUIRED,
        message: "X authorization required. Please authenticate with X.",
      };
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: config.x.clientId,
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (config.x.clientSecret) {
      const authHeader = Buffer.from(`${config.x.clientId}:${config.x.clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${authHeader}`;
    }

    try {
      const response = await fetch(`${config.x.apiBaseUrl}/2/oauth2/token`, {
        method: "POST",
        headers,
        body: body.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          statusCode: 401,
          code: X_ERROR_CODES.X_TOKEN_REFRESH_FAILED,
          message: "Failed to refresh X authorization token.",
        };
      }

      tokenStore.saveTokens(sessionKey, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || tokens.refreshToken,
        expiresIn: data.expires_in,
      });

      return data.access_token;
    } catch (error) {
      if (error.code) throw error;
      throw {
        statusCode: 401,
        code: X_ERROR_CODES.X_TOKEN_REFRESH_FAILED,
        message: "Unable to refresh X access token.",
      };
    }
  }

  /**
   * Get valid access token for session
   */
  async getValidAccessToken(sessionKey) {
    const tokens = tokenStore.getTokens(sessionKey);
    if (!tokens || !tokens.accessToken) {
      // In development mode or demo mode, if credentials are missing/unconfigured, throw explicit missing X permissions error
      if (!config.x.clientId) {
        throw {
          statusCode: 401,
          code: X_ERROR_CODES.X_INSUFFICIENT_PERMISSIONS,
          message: "X Developer API credentials not configured in backend environment.",
        };
      }
      throw {
        statusCode: 401,
        code: X_ERROR_CODES.X_AUTH_REQUIRED,
        message: "Authentication required. Please connect your X account.",
      };
    }

    if (Date.now() >= tokens.expiresAt - 60000) {
      return await this.refreshAccessToken(sessionKey);
    }

    return tokens.accessToken;
  }

  /**
   * Upload Media (PNG Card) to X API
   */
  async uploadMedia(accessToken, imageBuffer, mimeType) {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append("media", blob, "hhgoa-card.png");

    try {
      const response = await fetch(`${config.x.uploadApiBaseUrl}/1.1/media/upload.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.media_id_string) {
        throw {
          statusCode: response.status || 500,
          code: X_ERROR_CODES.X_MEDIA_UPLOAD_FAILED,
          message: data.errors?.[0]?.message || "Failed to upload image media to X API.",
        };
      }

      return data.media_id_string;
    } catch (error) {
      if (error.code) throw error;
      throw {
        statusCode: 500,
        code: X_ERROR_CODES.X_MEDIA_UPLOAD_FAILED,
        message: "Media upload to X failed.",
      };
    }
  }

  /**
   * Create X Post with FIXED HH Goa Caption & Uploaded Card Media
   */
  async createPost(accessToken, mediaId) {
    const payload = {
      text: X_POST_CAPTION, // ALWAYS fixed caption, ignoring any client input
      media: {
        media_ids: [mediaId],
      },
    };

    try {
      const response = await fetch(`${config.x.apiBaseUrl}/2/tweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          statusCode: response.status || 500,
          code: X_ERROR_CODES.X_POST_FAILED,
          message: data.detail || data.title || "Failed to publish post on X.",
        };
      }

      const tweetId = data.data?.id;
      return {
        success: true,
        message: "HH Goa card shared successfully",
        postUrl: tweetId ? `https://x.com/i/status/${tweetId}` : "https://x.com",
      };
    } catch (error) {
      if (error.code) throw error;
      throw {
        statusCode: 500,
        code: X_ERROR_CODES.X_POST_FAILED,
        message: "Failed to publish post on X API.",
      };
    }
  }

  /**
   * Main Share Service Method
   */
  async shareCard({ file, sessionKey }) {
    // 1. Image Validation
    const validation = validateCardImage(file);
    if (!validation.isValid) {
      throw {
        statusCode: 400,
        code: validation.code,
        message: validation.message,
      };
    }

    // 2. Duplicate Share Check
    if (tokenStore.isDuplicateShare(file.buffer)) {
      throw {
        statusCode: 429,
        code: X_ERROR_CODES.X_DUPLICATE_SHARE,
        message: "This card was recently shared. Please wait a moment before sharing again.",
      };
    }

    // 3. Obtain Access Token
    const accessToken = await this.getValidAccessToken(sessionKey);

    // 4. Upload Image to X
    const mediaId = await this.uploadMedia(accessToken, file.buffer, file.mimetype);

    // 5. Publish Post with FIXED Caption
    return await this.createPost(accessToken, mediaId);
  }
}

export const xService = new XService();
