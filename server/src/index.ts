import app from "./app";
import { config } from "./config";
import mongoose from "mongoose";

const PORT = config.port || 3000;

// Connect to MongoDB
mongoose
  .connect(config.db.uri)
  .then(() => {
    console.log("Connected to MongoDB");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
