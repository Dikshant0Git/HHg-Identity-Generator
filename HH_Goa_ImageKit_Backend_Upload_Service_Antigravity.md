# HH Goa 2026 — ImageKit Persistent Image Upload Service

## Scope

Implement **ONLY the backend-side ImageKit upload integration** for the HH Goa 2026 ID Card Generator.

The existing backend currently uses **Multer with `memoryStorage`** for image uploads.

Replace the current temporary in-memory image handling with a proper ImageKit upload pipeline so participant photographs are persisted and can later be displayed by the public QR/profile card.

### Backend only

Do NOT modify:
- React/frontend code
- card rendering
- QR generation
- PNG download
- X sharing or X OAuth
- frontend routing/state/animations/styling
- unrelated backend features

Preserve the existing API contract wherever possible.

---

## 1. Required Flow

Current conceptual flow:

```text
Frontend
  ↓ multipart/form-data
Multer memoryStorage
  ↓
req.file.buffer
```

Required flow:

```text
Frontend
  ↓
Multer memoryStorage
  ↓
req.file.buffer
  ↓
ImageKit Upload API
  ↓
persistent ImageKit URL + fileId
  ↓
Participant database
```

The image must be persisted in ImageKit.

The database must store the ImageKit URL (and preferably its fileId), **not the image binary**.

---

## 2. Keep Multer Memory Storage

Do not blindly remove Multer.

Keeping:

```js
memoryStorage()
```

is appropriate because the file only needs to live in RAM while it is uploaded to ImageKit.

Desired lifecycle:

```text
request
  ↓
Multer memory buffer
  ↓
ImageKit
  ↓
save URL/fileId
  ↓
request completes
  ↓
buffer released
```

Do not write the upload to local disk unless the existing architecture specifically requires it.

Avoid:

```text
RAM → disk → ImageKit
```

Prefer:

```text
RAM → ImageKit → URL
```

---

## 3. ImageKit Environment Variables

Update `.env.example`:

```env
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

The private key is **backend-only**.

Never expose it through:

```env
VITE_IMAGEKIT_PRIVATE_KEY
```

or any other client-bundled variable.

Follow existing environment/config conventions if they differ.

---

## 4. Existing Backend Audit

Before coding, inspect:

- framework/runtime
- package.json
- routes
- controllers
- services
- participant model
- existing Multer middleware
- upload validation
- database layer
- error handling
- logging
- rate limiting
- tests

Integrate with the existing architecture.

Do not create a second architecture.

---

## 5. ImageKit Service

If appropriate for the existing architecture, isolate ImageKit operations in:

```text
services/
└── imagekit/
    └── imagekit.service.*
```

or an equivalent existing service location.

The service should handle:

- ImageKit client configuration
- upload
- folder selection
- controlled file naming
- upload options
- response normalization
- ImageKit error mapping
- optional deletion for cleanup

Controllers must not directly call the ImageKit SDK.

Preferred:

```text
controller
  ↓
participant/image service
  ↓
ImageKit service
  ↓
ImageKit
```

---

## 6. Participant Upload Integration

If an existing endpoint already accepts:

```http
POST /api/participants
```

with multipart data such as:

```text
photo
name
stack
builderClass
```

keep that endpoint.

Internally change:

```text
Multer buffer
```

into:

```text
ImageKit persistent asset
```

Do not create duplicate upload APIs unnecessarily.

If a dedicated existing upload endpoint exists, adapt it.

---

## 7. Multer Configuration

Use memory storage with a strict size limit.

Example:

```js
multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})
```

Use an appropriate limit for the actual project.

Never allow unlimited image uploads.

---

## 8. Image Validation

Do not trust only `req.file.mimetype`.

Validate the actual image where practical.

Support only formats genuinely required by the project, for example:

```text
JPEG
PNG
WEBP
```

If HEIC support is required by the existing frontend, verify that the selected ImageKit/backend processing path supports it before claiming support.

Reject:

- missing image
- empty file
- unsupported format
- invalid image
- oversized file

Use stable error codes:

```text
IMAGE_REQUIRED
IMAGE_TOO_LARGE
IMAGE_TYPE_NOT_SUPPORTED
IMAGE_INVALID
IMAGE_UPLOAD_FAILED
```

Avoid unnecessary server-side conversion or CPU-heavy processing.

---

## 9. ImageKit Folder

Use a predictable folder such as:

```text
hh-goa-2026/participants/
```

Do not place participant images at the ImageKit root.

Conceptual result:

```text
hh-goa-2026/
└── participants/
    ├── HHGOA7757.jpg
    ├── HHGOA7758.jpg
    └── HHGOA7759.jpg
```

---

## 10. File Naming

Do not trust the user's original filename.

Prefer an application-controlled name, ideally based on the unique Builder ID:

```text
HHGOA7757.jpg
```

If the Builder ID is generated after upload, use a secure temporary unique identifier and associate the returned asset with the participant afterward.

Prevent filename collisions.

---

## 11. Database Schema

The participant record should contain persistent image metadata.

Example:

```js
{
  builderId: "HHGOA7757",
  name: "John Doe",
  stack: "MERN",
  builderClass: "Shipwright",
  photoUrl: "https://ik.imagekit.io/...",
  photoFileId: "...",
  createdAt: ...
}
```

At minimum, persist:

```text
photoUrl
```

Prefer also storing:

```text
photoFileId
```

because it allows future replacement/deletion.

Do NOT store:

```text
Buffer
binary image data
base64 image
```

in the database.

---

## 12. Correct Failure Order

Use this sequence:

```text
1. Validate request
2. Generate/resolve Builder ID
3. Upload photo to ImageKit
4. Receive URL/fileId
5. Create participant record
6. Return response
```

If ImageKit fails:

```text
ImageKit failure
  ↓
do not create participant
  ↓
return IMAGE_UPLOAD_FAILED
```

If ImageKit succeeds but database creation fails:

```text
database failure
  ↓
attempt ImageKit asset deletion
  ↓
return database error
```

Do not silently accumulate orphaned images.

---

## 13. Performance

The website must feel **snappy**.

Keep the backend path minimal:

```text
Multer RAM
  ↓
ImageKit
  ↓
Database
```

Avoid:

- local disk writes
- base64 conversion
- downloading and re-uploading images
- unnecessary transformations
- multiple sequential ImageKit requests
- unnecessary database queries
- heavy server-side image processing

Do not resize/process the image on the backend unless it is actually required.

ImageKit should serve the final image directly through its CDN.

---

## 14. Do Not Persist the Generated Card

This feature is for the **participant's source photograph**.

Do NOT upload the final generated HH Goa card PNG to ImageKit during participant creation.

Keep these flows separate:

```text
Participant photo
  ↓
ImageKit
  ↓
persistent photoUrl
```

versus:

```text
Generated card
  ↓
frontend
  ↓
local download
```

and:

```text
Generated card
  ↓
frontend
  ↓
X share backend
  ↓
X
```

---

## 15. QR/Profile Compatibility

The existing QR/profile API must eventually be able to return:

```json
{
  "builderId": "HHGOA7757",
  "name": "John Doe",
  "stack": "MERN",
  "builderClass": "Shipwright",
  "photoUrl": "https://ik.imagekit.io/..."
}
```

Do not proxy the image through the backend.

The frontend should render the ImageKit URL directly:

```jsx
<img src={photoUrl} />
```

This keeps profile loading fast and lets ImageKit/CDN handle image delivery.

Do not modify the frontend as part of this task.

---

## 16. Security

Validate uploads before sending them to ImageKit.

Protect against:

- oversized files
- invalid formats
- malformed images
- repeated abuse of the upload endpoint

Use existing authentication/rate limiting where appropriate.

Never log:

- ImageKit private key
- image binary data
- sensitive credentials

---

## 17. Error Handling

Map Multer errors appropriately.

Example:

```text
LIMIT_FILE_SIZE
  ↓
IMAGE_TOO_LARGE
```

Image validation:

```text
IMAGE_TYPE_NOT_SUPPORTED
IMAGE_INVALID
IMAGE_REQUIRED
```

ImageKit:

```text
IMAGE_UPLOAD_FAILED
```

Do not expose raw ImageKit SDK errors or stack traces.

Follow existing backend error conventions.

---

## 18. Logging

Keep concise operational logs such as:

```text
Image upload started
ImageKit upload succeeded
Participant saved
ImageKit upload failed
Participant save failed
```

Never log secrets or binary image contents.

---

## 19. Testing

Use the existing backend test framework.

Test:

### Upload validation
- valid JPEG
- valid PNG
- valid WebP if supported
- missing image
- oversized image
- unsupported image
- invalid image

### ImageKit service
Mock ImageKit.

Verify:
- correct folder
- controlled filename
- upload called once
- URL/fileId normalised
- ImageKit errors handled

### Database
Verify:
- `photoUrl` is stored
- `photoFileId` is stored if implemented
- no Buffer/base64 is stored
- participant is not created if ImageKit upload fails

### Failure recovery
Verify:

```text
ImageKit fails
→ no participant record
```

and:

```text
ImageKit succeeds
→ database fails
→ ImageKit cleanup is attempted
```

---

## 20. Definition of Done

- [ ] Existing backend audited first
- [ ] Existing Multer memoryStorage flow understood
- [ ] Multer memoryStorage retained
- [ ] Upload size limit exists
- [ ] Image validation exists
- [ ] ImageKit SDK/API integrated
- [ ] ImageKit private key stays server-side
- [ ] Participant photo persists in ImageKit
- [ ] ImageKit URL stored in database
- [ ] ImageKit fileId stored if appropriate
- [ ] Image binary is not stored in database
- [ ] Generated card PNG is not stored in ImageKit
- [ ] QR/profile API can expose the persistent photo URL
- [ ] ImageKit failure prevents broken participant creation
- [ ] Database failure after ImageKit upload attempts cleanup
- [ ] Predictable ImageKit folder/file naming
- [ ] Existing API contract preserved
- [ ] Tests pass
- [ ] No frontend changes
- [ ] No X changes
- [ ] No QR/card-generation changes
- [ ] Existing backend still builds and runs

---

# FINAL ANTIGRAVITY INSTRUCTION

Work **only on the backend ImageKit persistence layer**.

The current backend uses:

```text
Multer memoryStorage
```

Keep it as the temporary transport layer.

Implement exactly:

```text
Multer memory buffer
        ↓
ImageKit upload
        ↓
persistent ImageKit URL/fileId
        ↓
participant database
```

The purpose is to ensure that when somebody scans the QR code later, the public profile/card can retrieve the participant's persistent photograph.

Do not upload or persist the generated ID card PNG.

Do not implement X sharing.

Do not implement QR generation.

Do not implement card rendering.

Do not modify frontend code.

Do not introduce unnecessary infrastructure.

The implementation must be **fast, minimal, reliable, secure, and integrated into the existing backend architecture**.
