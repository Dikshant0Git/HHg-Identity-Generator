import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/hhgoa",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:5173",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "10", 10),
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
  },
  x: {
    clientId: process.env.X_CLIENT_ID || "",
    clientSecret: process.env.X_CLIENT_SECRET || "",
    redirectUri: process.env.X_REDIRECT_URI || "http://localhost:5000/api/x/callback",
    oauthStateSecret: process.env.X_OAUTH_STATE_SECRET || "default_secret_state",
    scopes: process.env.X_SCOPES || "tweet.read tweet.write users.read offline.access",
    apiBaseUrl: process.env.X_API_BASE_URL || "https://api.twitter.com",
    uploadApiBaseUrl: process.env.X_UPLOAD_API_BASE_URL || "https://upload.twitter.com",
  },
};
