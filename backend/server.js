import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { config } from "./src/config/env.js";

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`HH Goa Builder ID Server running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
