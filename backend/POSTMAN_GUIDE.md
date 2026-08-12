# HH Goa 2026 — Postman Testing Guide & API Reference

This guide provides instructions to test the **HH Goa 2026 Builder ID Generator Backend** using **Postman** (or terminal cURL).

---

## ⚡ Quick Start

### 1. Ensure the Backend Server is Running
Open a terminal in the `backend` directory and run:

```bash
npm run dev
```
You should see:
```text
MongoDB Connected: 127.0.0.1
HH Goa Builder ID Server running in development mode on port 5000
```

### 2. Import Postman Collection
1. Open **Postman**.
2. Click **Import** (top left).
3. Select the generated file: `HH_Goa_Backend.postman_collection.json` located in `backend/`.
4. All endpoints will load into a single collection: **HH Goa 2026 — Builder ID Generator API**.

---

## 📡 API Endpoint Reference & Sample Requests

### 1. Health Check
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health`
- **Headers**: None

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "service": "hhgoa-builder-id-api",
  "status": "healthy"
}
```

---

### 2. Create Participant
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/participants`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "aryan.sharma@example.com",
  "name": "Aryan Sharma",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "stack": ["AI", "React", "Node.js", "Python"],
  "social": {
    "xHandle": "@aryan_sharma",
    "github": "aryan-sharma",
    "linkedin": "aryan-sharma-goa",
    "bio": "Building AI apps for HH Goa 2026 hackathon!"
  }
}
```

**Expected Response** (`201 Created`):
```json
{
  "success": true,
  "created": true,
  "existing": false,
  "participant": {
    "publicId": "HH26-A7K92P",
    "name": "Aryan Sharma",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "stack": [
      "AI",
      "React",
      "Node.js",
      "Python"
    ],
    "builderClass": {
      "name": "NEURAL CARTOGRAPHER",
      "code": "A-07"
    },
    "social": {
      "xHandle": "@aryan_sharma",
      "github": "aryan-sharma",
      "linkedin": "aryan-sharma-goa",
      "bio": "Building AI apps for HH Goa 2026 hackathon!"
    },
    "status": "active",
    "profileUrl": "http://localhost:5173/id/HH26-A7K92P",
    "qrPayload": "http://localhost:5173/id/HH26-A7K92P"
  }
}
```

---

### 3. Re-Submit Duplicate Email (Idempotency Check)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/participants`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON with same email):
```json
{
  "email": "aryan.sharma@example.com",
  "name": "Aryan Sharma",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "stack": ["AI", "React"]
}
```

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "created": false,
  "existing": true,
  "participant": {
    "publicId": "HH26-A7K92P",
    "name": "Aryan Sharma",
    "profileUrl": "http://localhost:5173/id/HH26-A7K92P"
  }
}
```

---

### 4. Preview Builder Class
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/builder-class/preview`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "stack": ["React", "Tailwind", "Vite", "Figma"]
}
```

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "builderClass": {
    "name": "INTERFACE ARCHITECT",
    "code": "U-03"
  }
}
```

---

### 5. Get Public Profile (QR Verification Endpoint)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/profiles/<YOUR_PUBLIC_ID>` (e.g. `http://localhost:5000/api/profiles/HH26-A7K92P`)
- **Headers**: None

**Expected Response** (`200 OK`):
```json
{
  "success": true,
  "participant": {
    "publicId": "HH26-A7K92P",
    "name": "Aryan Sharma",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "stack": [
      "AI",
      "React",
      "Node.js",
      "Python"
    ],
    "builderClass": {
      "name": "NEURAL CARTOGRAPHER",
      "code": "A-07"
    },
    "social": {
      "xHandle": "@aryan_sharma",
      "github": "aryan-sharma",
      "linkedin": "aryan-sharma-goa",
      "bio": "Building AI apps for HH Goa 2026 hackathon!"
    },
    "status": "active"
  }
}
```
*Note: Sensitive identity fields (`email`, `identityKey`, `_id`) are stripped automatically.*

---

### 6. Validation Error Test
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/participants`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON with invalid fields):
```json
{
  "email": "not-an-email",
  "name": "",
  "photoUrl": "invalid-url",
  "stack": []
}
```

**Expected Response** (`400 Bad Request`):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email: Invalid email format, name: Name cannot be empty, photoUrl: Photo URL must be a valid URL, stack: Stack must contain at least 1 technology"
  }
}
```

---

### 7. Missing Profile Test (404)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/profiles/HH26-999999`
- **Headers**: None

**Expected Response** (`404 Not Found`):
```json
{
  "success": false,
  "error": {
    "code": "PARTICIPANT_NOT_FOUND",
    "message": "Participant not found."
  }
}
```

---

## 💻 Alternative: Terminal cURL Commands

If you prefer testing directly in terminal / PowerShell:

```bash
# 1. Health Check
curl -X GET http://localhost:5000/api/health

# 2. Create Participant
curl -X POST http://localhost:5000/api/participants \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.builder@example.com","name":"Demo Builder","photoUrl":"https://images.unsplash.com/photo-1534528741775-53994a69daeb","stack":["Rust","Security"]}'

# 3. Get Public Profile (replace HH26-XXXXXX)
curl -X GET http://localhost:5000/api/profiles/HH26-XXXXXX
```
