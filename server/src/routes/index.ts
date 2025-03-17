import { Router } from "express";
import authRoutes from "./authRoutes";
import businessRoutes from "./businessRoutes";
import orderRoutes from "./orderRoutes";
import callRoutes from "./callRoutes";
import aiTestRoutes from "./aiTestRoutes";

const router = Router();

// Log per debug
console.log("[ROUTES] Configurazione delle route in corso...");

router.use("/auth", authRoutes);
console.log("[ROUTES] Route /auth registrate");

// Cambiare da "/business" a "/businesses" per far funzionare le richieste
router.use("/businesses", businessRoutes); // <-- MODIFICA QUI (plurale)
console.log("[ROUTES] Route /businesses registrate");

router.use("/orders", orderRoutes);
console.log("[ROUTES] Route /orders registrate");

router.use("/call", callRoutes);
console.log("[ROUTES] Route /call registrate");

router.use("/ai-test", aiTestRoutes);
console.log("[ROUTES] Route /ai-test registrate");

// Aggiungi una route di test
router.get("/test", (req, res) => {
  res.json({ success: true, message: "API server is running" });
});

export default router;
