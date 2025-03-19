import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import routes from "./routes";
import redisService from "./services/redisService";
import transcriptionService from "./services/transcriptionService";
import aiTestRoutes from "./routes/aiTestRoutes";

const app = express();

// Middleware dell'ordine importante: cors deve venire PRIMA di helmet
// Modifica la configurazione CORS per essere più permissiva
app.use(
  cors({
    origin: ["http://localhost:5173", "https://phone-orders-ai.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Aggiungi questo per debug
app.use((req, res, next) => {
  console.log(`[CORS Debug] Request from origin: ${req.headers.origin}`);
  next();
});

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
app.use("/api/ai-test", aiTestRoutes);

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

// Aggiungi questo codice per debug
app.get("/api/routes-check", (req, res) => {
  // Crea un elenco di tutte le route registrate
  const routes: { path: any; method: string; }[] = [];

  app._router.stack.forEach((middleware: { route: { path: any; methods: {}; }; name: string; handle: { stack: any[]; }; regexp: any; }) => {
    if (middleware.route) {
      // Route registrata direttamente
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
      });
    } else if (middleware.name === "router") {
      // Router o stack di middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp
            ? `${middleware.regexp}`
            : "" + handler.route.path;
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          routes.push({ path, method });
        }
      });
    }
  });

  res.json({
    routes,
    message: "Questa è una lista di tutte le rotte API registrate",
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
