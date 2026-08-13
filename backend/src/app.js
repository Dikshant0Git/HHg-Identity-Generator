import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env.js";
import participantRoutes from "./routes/participant.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import builderClassRoutes from "./routes/builderClass.routes.js";
import xRoutes from "./routes/x.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.frontendUrl || "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-Key"],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Health Endpoint
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "hhgoa-builder-id-api",
    status: "healthy",
  });
});

// API Routes
app.use("/api/participants", participantRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/builder-class", builderClassRoutes);
app.use("/api/x", xRoutes);

// Fallback & Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
