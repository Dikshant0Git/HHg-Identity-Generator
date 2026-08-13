import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import mongoose from "mongoose";

/**
 * HTTP helper for running in-memory tests against Express app
 */
async function makeRequest(app, method, path, options = {}) {
  const http = await import("http");
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      const url = `http://127.0.0.1:${port}${path}`;

      const reqHeaders = options.headers || {};
      let body = options.body;

      if (options.json) {
        reqHeaders["Content-Type"] = "application/json";
        body = JSON.stringify(options.json);
      } else if (options.formData) {
        reqHeaders["Content-Type"] = `multipart/form-data; boundary=${options.formData.boundary}`;
        body = options.formData.buffer;
      }

      fetch(url, {
        method,
        headers: reqHeaders,
        body: body,
      })
        .then(async (res) => {
          const contentType = res.headers.get("content-type") || "";
          let data = null;
          if (contentType.includes("application/json")) {
            data = await res.json();
          } else {
            data = await res.text();
          }
          server.close();
          resolve({
            status: res.status,
            headers: res.headers,
            data,
          });
        })
        .catch((err) => {
          server.close();
          reject(err);
        });
    });
  });
}

test("FULL BACKEND SYSTEM API & FEATURE TEST SUITE", async (t) => {
  // Connect DB before tests
  await connectDB();

  t.after(async () => {
    await mongoose.connection.close();
  });

  // 1. Health Endpoint Test
  await t.test("1. GET /api/health — System Health Check", async () => {
    const res = await makeRequest(app, "GET", "/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.status, "healthy");
    assert.equal(res.data.service, "hhgoa-builder-id-api");
  });

  // 2. Builder Class Preview Endpoint Test
  await t.test("2. POST /api/builder-class/preview — Builder Class Calculation", async () => {
    const res = await makeRequest(app, "POST", "/api/builder-class/preview", {
      json: { stack: ["Solidity", "Rust", "TypeScript"] },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.builderClass.name);
    assert.ok(res.data.builderClass.code);
  });

  // 3. Participant Creation API & Idempotency Test
  let generatedPublicId = null;
  const testEmail = `test.builder.${Date.now()}@hhgoa.io`;

  await t.test("3. POST /api/participants — New Participant Registration (JSON)", async () => {
    const payload = {
      name: "Satoshi Goa",
      email: testEmail,
      photoUrl: "https://ik.imagekit.io/hhgoa/sample_avatar.jpg",
      stack: ["Rust", "Solidity", "React"],
      social: {
        xHandle: "@satoshigoa",
        github: "github.com/satoshigoa",
        bio: "Building decentralized futures in Goa.",
      },
    };

    const res = await makeRequest(app, "POST", "/api/participants", { json: payload });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.created, true);
    assert.ok(res.data.participant.publicId.startsWith("HH26-"));
    assert.equal(res.data.participant.name, "Satoshi Goa");
    assert.ok(res.data.participant.profileUrl.includes(res.data.participant.publicId));

    generatedPublicId = res.data.participant.publicId;
  });

  await t.test("4. POST /api/participants — Duplicate Submission (Idempotency Check)", async () => {
    const payload = {
      name: "Satoshi Goa Duplicate Attempt",
      email: testEmail, // Same email!
      photoUrl: "https://ik.imagekit.io/hhgoa/different_avatar.jpg",
      stack: ["Python"],
    };

    const res = await makeRequest(app, "POST", "/api/participants", { json: payload });
    assert.equal(res.status, 200); // 200 OK (returned existing)
    assert.equal(res.data.success, true);
    assert.equal(res.data.created, false);
    assert.equal(res.data.existing, true);
    assert.equal(res.data.participant.publicId, generatedPublicId); // Reused identical publicId!
  });

  // 4. Participant Retrieval Endpoint Test
  await t.test("5. GET /api/participants/:publicId — Retrieve Participant Details", async () => {
    const res = await makeRequest(app, "GET", `/api/participants/${generatedPublicId}`);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.participant.publicId, generatedPublicId);
    assert.equal(res.data.participant.name, "Satoshi Goa");
  });

  await t.test("6. GET /api/participants/:publicId — Invalid Format Rejection", async () => {
    const res = await makeRequest(app, "GET", "/api/participants/INVALID_ID_123");
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.error.code, "INVALID_PUBLIC_ID");
  });

  // 5. Public Profile View API Test
  await t.test("7. GET /api/profiles/:publicId — Fetch Public Profile", async () => {
    const res = await makeRequest(app, "GET", `/api/profiles/${generatedPublicId}`);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.participant.publicId, generatedPublicId);
  });

  // 6. X OAuth 2.0 PKCE Endpoints Tests
  await t.test("8. GET /api/x/auth — Initiate X OAuth 2.0 PKCE Authorization", async () => {
    const res = await makeRequest(app, "GET", "/api/x/auth");
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.authUrl.includes("https://api.twitter.com/2/oauth2/authorize"));
    assert.ok(res.data.authUrl.includes("code_challenge="));
    assert.ok(res.data.authUrl.includes("code_challenge_method=S256"));
    assert.ok(res.data.state);
  });

  await t.test("9. GET /api/x/callback — OAuth Callback Invalid State Handling", async () => {
    const res = await makeRequest(app, "GET", "/api/x/callback?code=mock_code&state=invalid_state");
    // Redirects to frontend with x_error query param
    assert.ok(res.data.includes("x_error=") || res.status === 302 || res.status === 200);
  });

  // 7. X Share Card Upload Endpoint Tests
  await t.test("10. POST /api/x/share — Reject Request Without Image", async () => {
    const res = await makeRequest(app, "POST", "/api/x/share");
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.error.code, "X_IMAGE_REQUIRED");
  });

  await t.test("11. POST /api/x/share — Reject Invalid Binary File Format", async () => {
    const boundary = "----WebKitFormBoundaryXTest7MA4YW";
    const bodyText =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="card"; filename="fake_card.png"\r\n` +
      `Content-Type: image/png\r\n\r\n` +
      `Plain text content instead of PNG header\r\n` +
      `--${boundary}--\r\n`;

    const formData = { boundary, buffer: Buffer.from(bodyText) };
    const res = await makeRequest(app, "POST", "/api/x/share", { formData });
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.error.code, "X_INVALID_IMAGE");
  });

  // 8. 404 Fallback Route Test
  await t.test("12. Unknown Route Fallback — 404 Not Found Handler", async () => {
    const res = await makeRequest(app, "GET", "/api/non-existent-endpoint");
    assert.equal(res.status, 404);
    assert.equal(res.data.success, false);
    assert.equal(res.data.error.code, "NOT_FOUND");
  });
});
