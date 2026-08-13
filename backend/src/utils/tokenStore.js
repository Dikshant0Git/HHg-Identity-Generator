import crypto from "crypto";

/**
 * In-memory server-side state & token storage.
 * Keeps OAuth state, PKCE verifiers, access/refresh tokens server-side ONLY.
 */
class TokenStore {
  constructor() {
    this.states = new Map(); // state -> { codeVerifier, createdAt }
    this.tokens = new Map(); // sessionId/tokenKey -> { accessToken, refreshToken, expiresAt }
    this.recentShareHashes = new Map(); // hash -> timestamp (for duplicate share prevention)

    // Cleanup expired entries every 10 minutes
    const interval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
    if (interval.unref) interval.unref();
  }

  saveState(state, codeVerifier) {
    this.states.set(state, {
      codeVerifier,
      createdAt: Date.now(),
    });
  }

  getAndRemoveState(state) {
    if (!state || !this.states.has(state)) return null;
    const data = this.states.get(state);
    this.states.delete(state);

    // State valid for 10 minutes
    if (Date.now() - data.createdAt > 10 * 60 * 1000) {
      return null;
    }
    return data;
  }

  saveTokens(key, { accessToken, refreshToken, expiresIn }) {
    const expiresAt = Date.now() + (expiresIn ? expiresIn * 1000 : 7200 * 1000);
    this.tokens.set(key, {
      accessToken,
      refreshToken,
      expiresAt,
    });
  }

  getTokens(key) {
    return this.tokens.get(key) || null;
  }

  isDuplicateShare(buffer) {
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const now = Date.now();
    
    if (this.recentShareHashes.has(hash)) {
      const prevTime = this.recentShareHashes.get(hash);
      if (now - prevTime < 60 * 1000) { // 1 minute duplicate window
        return true;
      }
    }
    this.recentShareHashes.set(hash, now);
    return false;
  }

  cleanup() {
    const now = Date.now();

    for (const [state, data] of this.states.entries()) {
      if (now - data.createdAt > 10 * 60 * 1000) {
        this.states.delete(state);
      }
    }

    for (const [hash, timestamp] of this.recentShareHashes.entries()) {
      if (now - timestamp > 60 * 1000) {
        this.recentShareHashes.delete(hash);
      }
    }
  }
}

export const tokenStore = new TokenStore();
