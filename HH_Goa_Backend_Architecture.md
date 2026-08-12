# HH Goa 2026 --- Builder ID Generator Backend

## Antigravity Backend Implementation Specification

> Backend only. Do not implement frontend/UI concerns in this
> specification.

------------------------------------------------------------------------

## 1. Objective

Build a small, production-ready backend for the HH Goa 2026 Builder ID /
Frame Generator.

The backend has four responsibilities:

1.  Create exactly one persistent Builder ID for a participant.
2.  Store the participant data required to reproduce their ID and public
    profile.
3.  Provide a public verification/profile endpoint reached through the
    QR code.
4.  Support the generator's download/share workflow without introducing
    unnecessary account, ownership, or admin systems.

The application is intentionally small. Do **not** build authentication,
roles, payments, teams-as-accounts, ownership transfer, or an admin
dashboard unless explicitly requested later.

------------------------------------------------------------------------

# 2. Recommended Stack

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JavaScript
-   `nanoid` or Node `crypto` for public ID generation
-   `helmet`
-   `cors`
-   `express-rate-limit`
-   `zod` or Joi for request validation
-   `dotenv`

Suggested structure:

``` text
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── participant.controller.js
│   │   ├── profile.controller.js
│   │   └── builderClass.controller.js
│   ├── models/
│   │   └── participant.model.js
│   ├── routes/
│   │   ├── participant.routes.js
│   │   ├── profile.routes.js
│   │   └── builderClass.routes.js
│   ├── services/
│   │   ├── participant.service.js
│   │   ├── id.service.js
│   │   ├── builderClass.service.js
│   │   └── profile.service.js
│   ├── middleware/
│   │   ├── error.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validate.middleware.js
│   ├── validators/
│   │   └── participant.validator.js
│   ├── utils/
│   │   ├── apiResponse.js
│   │   └── slug.js
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

Use a feature-oriented organisation if preferred, but keep controllers,
services, models, validators, and routes clearly separated.

------------------------------------------------------------------------

# 3. Core Product Flow

## Generation

``` text
Frontend
   |
   | POST /api/participants
   v
Express Controller
   |
   v
Validation
   |
   v
Participant Service
   |
   +--> check existing participant identity
   |
   +--> generate persistent public ID if new
   |
   +--> generate deterministic builder class
   |
   +--> create MongoDB document
   |
   v
JSON response
   |
   +--> publicId
   +--> participant data
   +--> profileUrl
   +--> qrPayload
```

## QR verification

``` text
QR scan
   |
   v
https://your-domain.com/id/HH26-XXXXXX
   |
   v
Frontend profile route
   |
   v
GET /api/profiles/HH26-XXXXXX
   |
   v
MongoDB
   |
   v
Public participant profile
```

The QR code itself does not need to be stored as an image in MongoDB.

Store the public ID and construct the QR payload from the public profile
URL.

------------------------------------------------------------------------

# 4. Participant Identity / Duplicate Prevention

The requirement is that a participant must not repeatedly generate
different Builder IDs.

A backend cannot guarantee "one human per person" without some
verifiable identity mechanism.

For this project, use a **required email address as the unique
participant key**.

Important:

-   No password.
-   No user account system.
-   No login.
-   Email is used only as a uniqueness key.
-   Do not expose the email through the public profile.
-   Store a normalised lowercase/trimmed email.
-   Create a unique MongoDB index on `identityKey`.

Recommended identity fields:

``` text
identityKey = normalized email
email = normalized email
```

If the product later decides to use verified X handles instead, the
identity strategy can be replaced without changing the public ID
architecture.

### Duplicate behaviour

If the same email submits again:

``` text
POST /api/participants
```

the backend must return the existing participant rather than creating
another ID.

Response should indicate:

``` json
{
  "created": false,
  "existing": true,
  "participant": { ... }
}
```

Do not silently create another ID.

### Important limitation

Email uniqueness means **one ID per email**, not cryptographic proof of
one human.

Do not implement invasive fingerprinting merely to simulate stronger
identity.

------------------------------------------------------------------------

# 5. MongoDB Schema

Collection:

``` text
participants
```

Mongoose model:

``` js
const participantSchema = new mongoose.Schema(
  {
    identityKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    photoUrl: {
      type: String,
      required: true
    },

    stack: {
      type: [String],
      required: true,
      validate: {
        validator: value => value.length > 0
      }
    },

    builderClass: {
      name: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true
      }
    },

    social: {
      xHandle: {
        type: String,
        trim: true,
        maxlength: 50
      },
      github: {
        type: String,
        trim: true,
        maxlength: 150
      },
      linkedin: {
        type: String,
        trim: true,
        maxlength: 150
      },
      bio: {
        type: String,
        trim: true,
        maxlength: 280
      }
    },

    status: {
      type: String,
      enum: ["active"],
      default: "active"
    },

    profileViews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);
```

Indexes:

``` text
unique(identityKey)
unique(publicId)
index(createdAt)
```

Do not expose:

-   `_id`
-   email
-   internal MongoDB metadata

through the public profile response.

------------------------------------------------------------------------

# 6. Public ID Generation

Use a human-friendly identifier.

Format:

``` text
HH26-XXXXXX
```

Example:

``` text
HH26-A7K92P
```

Requirements:

-   cryptographically random
-   URL safe
-   uppercase
-   collision checked
-   unique MongoDB index
-   never regenerated for an existing participant

Recommended implementation:

``` text
prefix = HH26-
suffix = 6 random uppercase alphanumeric characters
```

Always handle the extremely unlikely collision by retrying creation with
another ID.

Do not use MongoDB `_id` as the public ID.

------------------------------------------------------------------------

# 7. Builder Class Generation

Builder class is generated by backend logic.

It must be deterministic for the same participant.

Example classes:

``` text
NEURAL CARTOGRAPHER
SYSTEMS ARCHITECT
PIXEL ALCHEMIST
PACKET PHANTOM
INTERFACE ARCHITECT
CODE NOMAD
LOGIC FORGE
SIGNAL HUNTER
```

Use stack/category signals to select an appropriate class.

Example mapping:

``` text
AI / ML           -> NEURAL CARTOGRAPHER
CYBERSECURITY     -> PACKET PHANTOM
REACT / UI / CSS  -> INTERFACE ARCHITECT
BACKEND / SYSTEMS -> SYSTEMS ARCHITECT
DESIGN            -> PIXEL ALCHEMIST
GENERAL CODE      -> CODE NOMAD
```

If multiple stacks match, use a deterministic priority or deterministic
hash.

Once generated, save the result to MongoDB.

Never generate a new class every time the profile is requested.

------------------------------------------------------------------------

# 8. Photo Handling

The backend should receive a reference to the uploaded image rather than
storing large image binaries in MongoDB.

Preferred flow:

``` text
Frontend
   |
   +--> upload image to object storage
   |
   +--> receives photoUrl
   |
   +--> POST participant with photoUrl
```

Recommended object storage can be Cloudinary, S3-compatible storage, or
another simple image CDN.

For the backend contract, only require:

``` text
photoUrl
```

Validate:

-   HTTPS URL
-   supported image extension/content type where possible
-   maximum logical size handled by the upload service

Do not store base64 images in MongoDB.

------------------------------------------------------------------------

# 9. API Endpoints

Base path:

``` text
/api
```

## Create or retrieve participant

``` http
POST /api/participants
```

Request:

``` json
{
  "email": "builder@example.com",
  "name": "Aryan Sharma",
  "photoUrl": "https://cdn.example.com/photo.jpg",
  "stack": ["AI", "React", "Node"],
  "social": {
    "xHandle": "@aryan",
    "github": "aryan",
    "linkedin": "aryan-sharma",
    "bio": "Building useful things."
  }
}
```

Response for new participant:

``` json
{
  "success": true,
  "created": true,
  "participant": {
    "publicId": "HH26-A7K92P",
    "name": "Aryan Sharma",
    "photoUrl": "https://cdn.example.com/photo.jpg",
    "stack": ["AI", "React", "Node"],
    "builderClass": {
      "name": "NEURAL CARTOGRAPHER",
      "code": "A-07"
    },
    "profileUrl": "https://your-domain.com/id/HH26-A7K92P",
    "qrPayload": "https://your-domain.com/id/HH26-A7K92P"
  }
}
```

Existing participant:

``` json
{
  "success": true,
  "created": false,
  "existing": true,
  "participant": {
    "publicId": "HH26-A7K92P",
    "name": "Aryan Sharma",
    "profileUrl": "https://your-domain.com/id/HH26-A7K92P"
  }
}
```

The frontend can then render the QR from `qrPayload`.

------------------------------------------------------------------------

# 10. Public Profile Endpoint

``` http
GET /api/profiles/:publicId
```

Example:

``` http
GET /api/profiles/HH26-A7K92P
```

Response:

``` json
{
  "success": true,
  "participant": {
    "publicId": "HH26-A7K92P",
    "name": "Aryan Sharma",
    "photoUrl": "https://cdn.example.com/photo.jpg",
    "stack": ["AI", "React", "Node"],
    "builderClass": {
      "name": "NEURAL CARTOGRAPHER",
      "code": "A-07"
    },
    "social": {
      "xHandle": "@aryan",
      "github": "aryan",
      "linkedin": "aryan-sharma",
      "bio": "Building useful things."
    },
    "status": "active"
  }
}
```

Never return:

``` text
email
identityKey
MongoDB _id
internal timestamps
```

unless specifically required.

Increment `profileViews` when a valid public profile is accessed, but do
not make analytics a core feature.

------------------------------------------------------------------------

# 11. Optional Participant Lookup

The frontend may need to restore a previously generated card.

Use:

``` http
GET /api/participants/:publicId
```

However, keep the returned data privacy-safe.

Do not create an endpoint that searches participants by email.

The public ID is the lookup key for public data.

------------------------------------------------------------------------

# 12. Controllers

## participant.controller.js

Responsibilities:

``` text
createParticipant()
getParticipant()
```

Controller responsibilities should be limited to:

1.  Read request.
2.  Validate input through middleware.
3.  Call participant service.
4.  Return HTTP response.
5.  Pass errors to error middleware.

Do not put MongoDB logic directly in controllers.

------------------------------------------------------------------------

## profile.controller.js

Responsibilities:

``` text
getPublicProfile()
```

Flow:

``` text
publicId
   ↓
validate format
   ↓
service lookup
   ↓
increment view count
   ↓
sanitize response
   ↓
return public profile
```

------------------------------------------------------------------------

## builderClass.controller.js

Optional endpoint:

``` http
POST /api/builder-class/preview
```

This can allow the generator to preview a class before participant
creation.

However, this endpoint is optional.

The final class must always be generated and persisted by the
participant service when the ID is issued.

------------------------------------------------------------------------

# 13. Services

## participant.service.js

Main methods:

``` text
createOrGetParticipant(data)
getParticipantByPublicId(publicId)
```

`createOrGetParticipant()` must:

1.  Normalize email.
2.  Check `identityKey`.
3.  Return existing participant if found.
4.  Generate builder class if new.
5.  Generate public ID.
6.  Create participant.
7.  Handle unique-index race conditions.
8.  Return sanitized participant.

Important:

Use the database unique constraint as the final protection against
duplicate creation.

Do not rely only on:

``` js
findOne()
```

followed by:

``` js
create()
```

because concurrent requests can race.

------------------------------------------------------------------------

## id.service.js

Methods:

``` text
generatePublicId()
```

Rules:

``` text
HH26-
+
6 uppercase random characters
```

Collision handling must retry.

------------------------------------------------------------------------

## builderClass.service.js

Methods:

``` text
generateBuilderClass(stack)
```

Return:

``` json
{
  "name": "NEURAL CARTOGRAPHER",
  "code": "A-07"
}
```

The function must be deterministic.

------------------------------------------------------------------------

## profile.service.js

Methods:

``` text
getPublicProfile(publicId)
incrementProfileViews(publicId)
```

Sanitize all private fields before returning the profile.

------------------------------------------------------------------------

# 14. Validation

Participant creation requires:

``` text
email
name
photoUrl
stack
```

Rules:

### Email

-   valid email format
-   max 254 characters
-   normalise lowercase

### Name

-   1--80 characters
-   trim whitespace
-   reject empty strings

### Photo URL

-   valid HTTPS URL
-   max 2,000 characters

### Stack

-   array
-   1--8 values
-   each value max 30 characters
-   normalise casing

### Social links

Optional.

Validate URLs rather than accepting arbitrary strings.

------------------------------------------------------------------------

# 15. Error Format

All errors should use one format:

``` json
{
  "success": false,
  "error": {
    "code": "PARTICIPANT_NOT_FOUND",
    "message": "Participant not found."
  }
}
```

Suggested codes:

``` text
VALIDATION_ERROR
PARTICIPANT_NOT_FOUND
PARTICIPANT_ALREADY_EXISTS
INVALID_PUBLIC_ID
RATE_LIMITED
DATABASE_ERROR
INTERNAL_ERROR
```

Use appropriate HTTP statuses:

``` text
400 -> validation
404 -> not found
409 -> conflict where appropriate
429 -> rate limit
500 -> server error
```

------------------------------------------------------------------------

# 16. Rate Limiting

Because participant creation is public, protect:

``` text
POST /api/participants
```

with a rate limiter.

Suggested starting point:

``` text
10 creation requests / IP / 15 minutes
```

Public profile requests can have a more generous limit.

Do not introduce authentication merely for rate limiting.

------------------------------------------------------------------------

# 17. Security

Implement:

-   Helmet
-   CORS restricted to the frontend domain
-   request body size limits
-   rate limiting
-   schema validation
-   URL validation
-   sanitized public responses
-   environment variables for secrets
-   MongoDB connection string in `.env`
-   production error messages that do not expose stack traces

Never expose:

``` text
MONGODB_URI
JWT secrets
storage credentials
internal IDs
email identity keys
```

There is no JWT requirement for this application.

------------------------------------------------------------------------

# 18. Environment Variables

`.env.example`

``` env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/hhgoa

FRONTEND_URL=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=10
```

If an image-storage provider is added:

``` env
STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_API_KEY=
STORAGE_API_SECRET=
```

------------------------------------------------------------------------

# 19. Route Map

``` text
POST   /api/participants
GET    /api/participants/:publicId

GET    /api/profiles/:publicId

POST   /api/builder-class/preview

GET    /api/health
```

Health endpoint:

``` http
GET /api/health
```

Response:

``` json
{
  "success": true,
  "service": "hhgoa-builder-id-api",
  "status": "healthy"
}
```

------------------------------------------------------------------------

# 20. QR Architecture

The backend does not generate the QR image.

It returns:

``` text
qrPayload
```

Example:

``` text
https://your-domain.com/id/HH26-A7K92P
```

The React frontend generates the QR using `qrcode.react` or an
equivalent QR library.

This keeps QR presentation completely separate from participant
identity.

The QR must always point to the public ID route.

------------------------------------------------------------------------

# 21. Profile Route Behaviour

The frontend owns:

``` text
/id/:publicId
```

Example:

``` text
https://your-domain.com/id/HH26-A7K92P
```

That page calls:

``` http
GET /api/profiles/HH26-A7K92P
```

The backend returns the participant's public profile.

If the ID is invalid:

``` text
404
```

The frontend should show a branded:

``` text
BUILDER NOT FOUND
```

page.

------------------------------------------------------------------------

# 22. No Authentication

Do not implement:

-   login
-   signup
-   password
-   JWT
-   OAuth
-   sessions
-   user roles
-   admin accounts
-   ownership claims

The product is intentionally lightweight.

The email uniqueness key exists only to prevent repeated ID issuance.

------------------------------------------------------------------------

# 23. No Team Backend Yet

The current requirement does not require a persistent team-management
system.

Do not create:

``` text
teams
teamMembers
teamOwnership
invitations
teamRoles
```

If a combined team frame is implemented later, the frontend can compose
multiple existing participant records.

A backend team feature should only be added if the product requirement
explicitly changes.

------------------------------------------------------------------------

# 24. Data Privacy

The public QR profile should expose only information intended for public
sharing:

``` text
name
photo
stack
builder class
public ID
social links
bio
status
```

Never expose:

``` text
email
identityKey
database ID
internal metadata
```

The participant's email should not appear on the generated card or
public profile.

------------------------------------------------------------------------

# 25. Database Creation Rules

A participant is created only when all required data is present.

Pseudo-flow:

``` js
async function createOrGetParticipant(input) {
  const identityKey = normalizeEmail(input.email);

  const existing = await Participant.findOne({ identityKey });

  if (existing) {
    return {
      created: false,
      participant: sanitizeParticipant(existing)
    };
  }

  const builderClass = generateBuilderClass(input.stack);
  const publicId = await generateUniquePublicId();

  try {
    const participant = await Participant.create({
      identityKey,
      email: identityKey,
      publicId,
      name: input.name,
      photoUrl: input.photoUrl,
      stack: normalizeStack(input.stack),
      builderClass,
      social: input.social
    });

    return {
      created: true,
      participant: sanitizeParticipant(participant)
    };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const existingParticipant =
        await Participant.findOne({ identityKey });

      return {
        created: false,
        participant: sanitizeParticipant(existingParticipant)
      };
    }

    throw error;
  }
}
```

The unique MongoDB index is mandatory.

------------------------------------------------------------------------

# 26. API Contract for Frontend

The frontend should only need these concepts:

### Create

``` text
POST /api/participants
```

### Public verification

``` text
GET /api/profiles/:publicId
```

### Health

``` text
GET /api/health
```

Everything else is internal implementation detail.

------------------------------------------------------------------------

# 27. Backend Definition of Done

The backend is complete when all of the following work:

-   [ ] MongoDB connects successfully.
-   [ ] Participant schema exists.
-   [ ] `identityKey` has a unique index.
-   [ ] `publicId` has a unique index.
-   [ ] Participant creation validates input.
-   [ ] A new participant receives exactly one public ID.
-   [ ] Re-submitting the same email returns the existing participant.
-   [ ] Builder class is deterministic and persisted.
-   [ ] Public profile endpoint works using the public ID.
-   [ ] Public profile never exposes email or internal IDs.
-   [ ] QR payload can be constructed from `publicId`.
-   [ ] Rate limiting is enabled.
-   [ ] Helmet/CORS/security middleware is enabled.
-   [ ] Errors use a consistent API format.
-   [ ] Health endpoint works.
-   [ ] No authentication system is introduced.
-   [ ] No unnecessary team/ownership/admin system is introduced.

------------------------------------------------------------------------

# 28. Implementation Priority

Build in this order:

``` text
1. Express application
2. MongoDB connection
3. Participant model
4. Public ID service
5. Builder class service
6. Participant service
7. Participant controller
8. Profile controller
9. Routes
10. Validation
11. Error handling
12. Rate limiting/security
13. Health endpoint
14. API documentation
```

Keep the implementation small.

The backend exists to support the ID generator, persistent identity, and
QR verification --- nothing more.

------------------------------------------------------------------------

# 29. Final Architecture

``` text
                    ┌──────────────────────┐
                    │      React App       │
                    │                      │
                    │ Generator / ID Card  │
                    │ Public Profile Page  │
                    └──────────┬───────────┘
                               │
                         HTTPS / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Express API     │
                    ├──────────────────────┤
                    │ Routes               │
                    │ Controllers          │
                    │ Validation           │
                    │ Rate Limiting        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Services       │
                    ├──────────────────────┤
                    │ Participant Service  │
                    │ ID Service           │
                    │ Builder Class        │
                    │ Profile Service      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │                      │
                    │   participants       │
                    │                      │
                    │ unique identityKey   │
                    │ unique publicId      │
                    └──────────────────────┘

QR:
https://domain.com/id/HH26-A7K92P
                │
                ▼
        React Profile Route
                │
                ▼
GET /api/profiles/HH26-A7K92P
                │
                ▼
             MongoDB
```

## Antigravity instruction

Implement this backend specification exactly as described.

Prioritise correctness, simplicity, clean separation of concerns, and a
small API surface.

Do not add speculative infrastructure.

Do not implement frontend components.

Do not implement authentication.

Do not implement ownership.

Do not implement admin functionality.

Do not implement persistent teams.

The only persistent identity requirement is:

**one participant identity key → one persistent HH26 public ID → one
publicly verifiable profile.**
