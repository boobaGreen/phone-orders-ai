import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import routes from "./routes";
import redisService from "./services/redisService";
import transcriptionService from "./services/transcriptionService";

const app = express();

// Middleware dell'ordine importante: cors deve venire PRIMA di helmet
// Configurazione CORS più permissiva per lo sviluppo locale
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://phone-orders-ai.vercel.app", // Assicurati che questo sia presente
    ],
    credentials: true,
  })
);

// Configura Helmet in modo meno restrittivo per lo sviluppo
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// Middleware per il parsing del corpo delle richieste
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Health check route più completo
app.get("/health", (req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "OK",
    environment: process.env.NODE_ENV,
    services: {
      database: mongoStatus,
      redis: redisService.isConnected ? "connected" : "disconnected",
      vosk: transcriptionService.getStatus().ready ? "ready" : "not ready",
    },
    uptime: process.uptime() + "s",
  });
});

// Database connection
mongoose
  .connect(config.db.uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

export default app;
