import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import routes from "./routes";

const app = express();

// Middleware dell'ordine importante: cors deve venire PRIMA di helmet
// Configurazione CORS più permissiva per lo sviluppo locale
app.use(
  cors({
    origin: "*", // In ambiente di sviluppo, permetti qualsiasi origine
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", environment: process.env.NODE_ENV });
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
