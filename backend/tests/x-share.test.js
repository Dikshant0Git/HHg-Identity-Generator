import test from "node:test";
import assert from "node:assert/strict";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "../src/utils/pkce.js";
import { validateCardImage } from "../src/utils/imageValidator.js";
import { tokenStore } from "../src/utils/tokenStore.js";
import { X_POST_CAPTION, X_ERROR_CODES } from "../src/constants/x.constants.js";
import { xService } from "../src/services/x.service.js";

test("PKCE Utility Tests", async (t) => {
  await t.test("should generate valid PKCE code verifier and challenge", () => {
    const verifier = generateCodeVerifier();
    assert.ok(verifier.length >= 43 && verifier.length <= 128);

    const challenge = generateCodeChallenge(verifier);
    assert.ok(challenge.length > 0);
    assert.notEqual(verifier, challenge);
  });

  await t.test("should generate secure state token", () => {
    const state1 = generateState();
    const state2 = generateState();
    assert.notEqual(state1, state2);
  });
});

test("Fixed Caption Enforcement Tests", async (t) => {
  await t.test("X_POST_CAPTION must strictly equal required branding string", () => {
    const expected = "Just forged my HH Goa 2026 ID 🌴\n#FrameInGoa";
    assert.equal(X_POST_CAPTION, expected);
  });

  await t.test("xService createPost must use fixed caption regardless of inputs", async () => {
    // Mock fetch for tweet creation
    const originalFetch = global.fetch;
    let payloadSent = null;

    global.fetch = async (url, options) => {
      if (url.includes("/2/tweets")) {
        payloadSent = JSON.parse(options.body);
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: { id: "123456789" } }),
        };
      }
      return { ok: false, status: 400, json: async () => ({}) };
    };

    try {
      const res = await xService.createPost("mock_token", "media_999");
      assert.equal(payloadSent.text, "Just forged my HH Goa 2026 ID 🌴\n#FrameInGoa");
      assert.deepEqual(payloadSent.media.media_ids, ["media_999"]);
      assert.equal(res.postUrl, "https://x.com/i/status/123456789");
    } finally {
      global.fetch = originalFetch;
    }
  });
});

test("Image Binary Validation Tests", async (t) => {
  await t.test("should accept valid PNG binary with correct magic bytes", () => {
    // Valid PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const file = {
      buffer: pngHeader,
      mimetype: "image/png",
      size: pngHeader.length,
    };

    const res = validateCardImage(file);
    assert.equal(res.isValid, true);
  });

  await t.test("should reject file exceeding 5MB max size limit", () => {
    const file = {
      buffer: Buffer.alloc(10),
      mimetype: "image/png",
      size: 6 * 1024 * 1024, // 6MB
    };

    const res = validateCardImage(file);
    assert.equal(res.isValid, false);
    assert.equal(res.code, X_ERROR_CODES.X_IMAGE_TOO_LARGE);
  });

  await t.test("should reject non-image file MIME types", () => {
    const file = {
      buffer: Buffer.from("hello world"),
      mimetype: "application/json",
      size: 11,
    };

    const res = validateCardImage(file);
    assert.equal(res.isValid, false);
    assert.equal(res.code, X_ERROR_CODES.X_INVALID_IMAGE);
  });

  await t.test("should reject spoofed file with invalid binary header", () => {
    const fakePng = Buffer.from("this is plain text, not a PNG image");
    const file = {
      buffer: fakePng,
      mimetype: "image/png",
      size: fakePng.length,
    };

    const res = validateCardImage(file);
    assert.equal(res.isValid, false);
    assert.equal(res.code, X_ERROR_CODES.X_INVALID_IMAGE);
  });
});

test("Token & State Store Tests", async (t) => {
  await t.test("should store and retrieve PKCE state securely", () => {
    const state = generateState();
    const verifier = generateCodeVerifier();

    tokenStore.saveState(state, verifier);

    const retrieved = tokenStore.getAndRemoveState(state);
    assert.equal(retrieved.codeVerifier, verifier);

    // Second call should return null as state was removed (one-time use)
    assert.equal(tokenStore.getAndRemoveState(state), null);
  });

  await t.test("should detect duplicate share requests for identical image binary", () => {
    const imageBuffer = Buffer.from("hhgoa_test_image_binary_content_123");

    const isDup1 = tokenStore.isDuplicateShare(imageBuffer);
    assert.equal(isDup1, false);

    const isDup2 = tokenStore.isDuplicateShare(imageBuffer);
    assert.equal(isDup2, true);
  });
});
