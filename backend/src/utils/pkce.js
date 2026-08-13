import crypto from "crypto";

/**
 * Base64URL encoding helper
 */
function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generate cryptographically secure PKCE code verifier (43-128 chars)
 */
export function generateCodeVerifier() {
  const buffer = crypto.randomBytes(32);
  return base64UrlEncode(buffer);
}

/**
 * Generate PKCE S256 code challenge from verifier
 */
export function generateCodeChallenge(codeVerifier) {
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return base64UrlEncode(hash);
}

/**
 * Generate cryptographically secure OAuth state
 */
export function generateState() {
  const buffer = crypto.randomBytes(24);
  return base64UrlEncode(buffer);
}
