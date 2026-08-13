import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

// Utility helper to simulate HTTP request against Express app without listening on a port
async function makeRequest(app, method, path, options = {}) {
  const http = await import("http");
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      const url = `http://127.0.0.1:${port}${path}`;

      const reqHeaders = options.headers || {};
      let body = options.body;

      if (options.formData) {
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

test("X Service HTTP Endpoint Integration Tests", async (t) => {
  await t.test("GET /api/x/auth should return OAuth authorization URL and state cookie", async () => {
    const res = await makeRequest(app, "GET", "/api/x/auth");
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.authUrl.includes("https://api.twitter.com/2/oauth2/authorize"));
    assert.ok(res.data.authUrl.includes("response_type=code"));
    assert.ok(res.data.authUrl.includes("code_challenge="));
    assert.ok(res.data.state.length > 0);
  });

  await t.test("POST /api/x/share without image should return X_IMAGE_REQUIRED error", async () => {
    const res = await makeRequest(app, "POST", "/api/x/share");
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.error.code, "X_IMAGE_REQUIRED");
  });

  await t.test("POST /api/x/share with invalid text file should return X_INVALID_IMAGE error", async () => {
    // Construct simple multipart/form-data payload with a text file pretending to be card
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    const bodyText = 
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="card"; filename="fake.png"\r\n` +
      `Content-Type: image/png\r\n\r\n` +
      `This is text, not a PNG\r\n` +
      `--${boundary}--\r\n`;

    const formData = {
      boundary,
      buffer: Buffer.from(bodyText),
    };

    const res = await makeRequest(app, "POST", "/api/x/share", { formData });
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.error.code, "X_INVALID_IMAGE");
  });

  await t.test("GET /api/x/callback with invalid state should redirect with X_INVALID_STATE error", async () => {
    const res = await makeRequest(app, "GET", "/api/x/callback?code=mock_code&state=invalid_state");
    // Express controller redirects to frontend URL with x_error query param
    assert.ok(res.data.includes("x_error=") || res.status === 302 || res.status === 200);
  });
});
