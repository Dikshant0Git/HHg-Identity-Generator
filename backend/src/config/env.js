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
};
