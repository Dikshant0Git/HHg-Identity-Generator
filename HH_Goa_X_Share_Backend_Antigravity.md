# HH Goa 2026 — X Share Backend Service

## Scope

Implement **ONLY the backend service required to publish the generated HH Goa 2026 ID card to X**.

Do not implement or modify frontend functionality in this task.

The frontend already handles:

- card rendering
- QR rendering
- card PNG generation/download
- Share to X button UI
- navigation
- animations
- responsive design

The backend must provide the secure X integration behind that button.

---

# 1. REQUIRED USER FLOW

The final flow is:

```text
Frontend
   |
   | User clicks "Share to X"
   |
   | sends generated card PNG
   v
Backend
   |
   ├── verify/authenticate X authorization
   ├── validate received image
   ├── upload image to X
   ├── use FIXED HH Goa caption
   └── create X post
   |
   v
X
   |
   └── post containing:
          fixed caption
          +
          generated HH Goa card image
```

The user does **NOT** provide a custom caption.

The X post caption is fixed by the application.

---

# 2. CRITICAL FRONTEND/BACKEND BOUNDARY

This task is **backend only**.

Do not build or modify:

- React components
- frontend forms
- card UI
- QR UI
- download functionality
- GSAP
- frontend routing
- frontend state
- frontend share button
- frontend styling

The frontend will eventually call the backend share endpoint.

Your responsibility is only to create the backend service and its API contract.

---

# 3. AUDIT EXISTING BACKEND FIRST

Before writing code, inspect the existing backend completely.

Identify:

- backend framework
- package.json
- existing architecture
- routes
- controllers
- services
- middleware
- authentication/session mechanism
- database models
- participant model
- existing upload/file handling
- existing HTTP client
- environment variable conventions
- error handling
- logging
- rate limiting
- testing setup

Integrate with the existing backend.

**Do not create a second backend architecture.**

Do not modify working participant registration, unique ID generation, QR/profile functionality, or unrelated APIs.

---

# 4. X API REQUIREMENT

Use the **currently supported X API** and OAuth implementation available to the configured X developer application.

Do NOT copy obsolete Twitter API v1.1 examples without verifying that they are currently supported.

The implementation must verify that the configured X developer application supports:

- user authorization
- posting
- image media upload
- required OAuth scopes

If the current X account/API plan does not support media upload or posting, do not fake a working implementation.

Clearly report the missing X capability or permission.

---

# 5. SECURITY

These values MUST remain backend-only:

```env
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REDIRECT_URI=
X_OAUTH_STATE_SECRET=
X_SCOPES=
X_API_BASE_URL=
```

Never expose:

- X client secret
- access tokens
- refresh tokens
- OAuth authorization codes
- PKCE verifier

to the frontend.

Never use `VITE_` variables for X secrets.

Never log tokens or secrets.

---

# 6. OAUTH 2.0 + PKCE

Implement the current X OAuth 2.0 Authorization Code Flow with PKCE where required.

Conceptual flow:

```text
Client
  |
  | request X authorization
  v
Backend
  |
  | generate secure state
  | generate PKCE verifier/challenge
  v
X authorization
  |
  v
Backend callback
  |
  | validate state
  | exchange authorization code
  | securely store authorization
  v
Authenticated X account
```

Requirements:

- cryptographically secure state
- PKCE
- state validation
- authorization-denied handling
- invalid/expired authorization-code handling
- token refresh where supported
- secure server-side token storage
- no tokens returned to the frontend

Use the existing backend authentication/session architecture where possible.

Do not build a large authentication system just for this feature.

---

# 7. FIXED X POST CAPTION

## This is mandatory.

The caption is **NOT user-editable**.

The frontend must not send a caption to the backend.

The backend must own the final caption.

Create a backend constant/configuration value such as:

```js
X_POST_CAPTION
```

Use the exact caption already agreed for the HH Goa project:

```text
Just forged my HH Goa 2026 ID 🌴
#FrameInGoa
```

Do not allow the client to override it.

Do not accept:

```json
{
  "caption": "..."
}
```

from the client.

Do not dynamically append `#FrameInGoa` because it is already part of the fixed caption.

If the project team later changes the wording, the backend constant/configuration is changed.

The final X post must always contain:

```text
Just forged my HH Goa 2026 ID 🌴
#FrameInGoa
```

plus the generated card image.

---

# 8. SHARE ENDPOINT

Create:

```http
POST /api/x/share
```

The request must contain the generated card image only.

Prefer:

```text
multipart/form-data

card: <generated PNG>
```

There must be **no caption field**.

The backend itself determines the caption.

Conceptual request:

```text
POST /api/x/share
Content-Type: multipart/form-data

card = generated-card.png
```

---

# 9. IMAGE VALIDATION

The frontend generates the final card PNG.

The backend receives it.

Validate:

- image exists
- actual file content
- MIME type
- file extension
- file size
- valid image structure

Do not trust only the filename or client-provided MIME type.

Use a reasonable maximum file size based on the current X API media constraints.

Reject invalid uploads with a stable error code.

The backend must not generate the visual card.

---

# 10. X MEDIA + POST FLOW

The backend performs:

```text
Received card PNG
       |
       v
Validate image
       |
       v
Obtain authorized X access token
       |
       v
Upload image through currently supported X API
       |
       v
Receive media identifier
       |
       v
Create X post using:
       |
       ├── fixed HH Goa caption
       └── media identifier
       |
       v
Return result
```

Do not permanently store the generated card image unless the existing application has a legitimate requirement for it.

Do not store card image binaries in MongoDB.

---

# 11. SUCCESS RESPONSE

On successful posting:

```json
{
  "success": true,
  "message": "HH Goa card shared successfully",
  "postUrl": "https://x.com/..."
}
```

The exact response structure should follow existing backend conventions.

Never return:

- access token
- refresh token
- client secret
- authorization code
- PKCE verifier
- sensitive X API response data

---

# 12. ERROR RESPONSE

Use stable error codes.

Example:

```json
{
  "success": false,
  "code": "X_MEDIA_UPLOAD_FAILED",
  "message": "Unable to upload the HH Goa card to X."
}
```

Potential codes:

```text
X_AUTH_REQUIRED
X_AUTH_DENIED
X_INVALID_STATE
X_TOKEN_EXPIRED
X_TOKEN_REFRESH_FAILED
X_INSUFFICIENT_PERMISSIONS
X_IMAGE_REQUIRED
X_INVALID_IMAGE
X_IMAGE_TOO_LARGE
X_MEDIA_UPLOAD_FAILED
X_POST_FAILED
X_RATE_LIMITED
X_API_UNAVAILABLE
X_REQUEST_TIMEOUT
```

Do not expose raw X API errors or stack traces to the client.

Log technical details server-side.

---

# 13. TOKEN REFRESH

If X provides refresh tokens through the selected OAuth flow:

```text
access token expired
       |
       v
refresh token server-side
       |
       v
store updated authorization
       |
       v
retry operation once
```

Never retry indefinitely.

If refresh fails:

```text
X_AUTH_REQUIRED
```

should be returned.

---

# 14. DUPLICATE SHARE PROTECTION

The user may accidentally press Share multiple times.

Prevent obvious duplicate posts.

If practical within the existing backend architecture, support a client-generated request ID:

```text
requestId
```

However, do not require frontend implementation in this task.

The backend must remain safe if the same request is accidentally submitted twice.

Do not introduce queues, Redis clusters, or distributed infrastructure for this small application.

---

# 15. RATE LIMITING

Protect:

```http
POST /api/x/share
```

with the existing backend rate limiter.

If no rate limiter exists, add a lightweight appropriate mechanism.

Purpose:

- prevent accidental repeated posting
- prevent abuse
- avoid unnecessary X API calls

Do not over-engineer this.

---

# 16. BACKEND FEATURE STRUCTURE

Follow the existing backend architecture.

If feature-based architecture is already present, use:

```text
features/
└── x/
    ├── x.routes.*
    ├── x.controller.*
    ├── x.service.*
    ├── x.oauth.*
    ├── x.validation.*
    └── x.constants.*
```

Adapt names/extensions to the existing project.

### x.routes

Register:

```text
GET  /api/x/auth
GET  /api/x/callback
POST /api/x/share
```

### x.controller

Responsible for:

- request validation
- calling service functions
- OAuth redirects
- response formatting

Keep controllers thin.

### x.oauth

Responsible for:

- state generation
- PKCE
- authorization URL
- callback
- token exchange
- token refresh

### x.service

Responsible for:

- image processing/validation handoff
- X media upload
- fixed caption application
- X post creation
- error mapping

### x.validation

Responsible for:

- image validation
- callback parameter validation
- request validation

### x.constants

Contains:

```text
X_POST_CAPTION
```

and any other safe X configuration constants.

---

# 17. ENVIRONMENT FILE

Update `.env.example` only.

Example:

```env
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REDIRECT_URI=http://localhost:5000/api/x/callback
X_OAUTH_STATE_SECRET=
X_SCOPES=tweet.read,tweet.write,users.read,offline.access
X_API_BASE_URL=
FRONTEND_URL=http://localhost:5173
```

Follow the actual backend port and configuration conventions.

Never commit real credentials.

---

# 18. TESTING

Use the existing backend testing framework.

Test at minimum:

## OAuth

- authorization URL generation
- secure state generation
- invalid state rejection
- denied authorization
- successful callback
- failed token exchange
- token refresh

## Fixed caption

Verify that every successful post uses exactly:

```text
Just forged my HH Goa 2026 ID 🌴
#FrameInGoa
```

Verify that a client cannot override it.

Requests such as:

```json
{
  "caption": "my own caption"
}
```

must not change the final post.

## Image

- PNG accepted
- unsupported image rejected
- invalid image rejected
- oversized image rejected
- missing image rejected

## Share

- unauthenticated request handled
- authorization required
- media upload failure handled
- post creation failure handled
- successful post returns post URL

## Duplicate requests

Verify obvious repeated submissions do not unintentionally create duplicate posts.

---

# 19. DO NOT IMPLEMENT FRONTEND

This task ends at the backend API boundary.

Do NOT create or modify:

- React components
- Share to X button
- card preview
- card rendering
- QR code
- download button
- caption input
- frontend routing
- Redux
- GSAP
- Tailwind
- responsive UI

The frontend work will be handled separately.

The backend only needs to expose the API necessary for the frontend to trigger X sharing.

---

# 20. DEFINITION OF DONE

The backend X service is complete when:

- [ ] Existing backend audited first
- [ ] Existing architecture reused
- [ ] X OAuth 2.0 implemented
- [ ] PKCE implemented where required
- [ ] OAuth state securely validated
- [ ] X secrets remain server-side
- [ ] X access/refresh tokens remain server-side
- [ ] `GET /api/x/auth` works
- [ ] `GET /api/x/callback` works
- [ ] `POST /api/x/share` works
- [ ] Share endpoint accepts card image
- [ ] Share endpoint does NOT accept a user caption
- [ ] Fixed caption is backend-controlled
- [ ] Fixed caption is exactly:

      Just forged my HH Goa 2026 ID 🌴
      #FrameInGoa

- [ ] Card image is uploaded using the currently supported X API
- [ ] X post is created with image + fixed caption
- [ ] Successful post URL is returned
- [ ] OAuth failures handled
- [ ] X API failures handled
- [ ] Image validation implemented
- [ ] Rate limiting implemented
- [ ] Duplicate share protection implemented appropriately
- [ ] Tests pass
- [ ] No unrelated backend functionality changed
- [ ] No secrets committed
- [ ] Existing backend still starts/builds successfully

---

# FINAL INSTRUCTION TO ANTIGRAVITY

Work **only on the backend X Share Service**.

Do not touch the frontend.

Do not implement the download feature.

Do not implement card rendering.

Do not implement QR generation.

Do not implement a custom-caption feature.

The frontend will eventually provide only the generated card image to:

```http
POST /api/x/share
```

The backend owns the X authorization, media upload, and post creation.

The X caption is fixed and backend-controlled.

Do not claim the feature works unless the configured X developer application actually has the required current API permissions for image posting.
