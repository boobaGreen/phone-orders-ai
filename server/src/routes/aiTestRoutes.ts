import express, { Request, Response } from "express";
import {
  chat,
  processAudio,
  resetConversation,
  getMenu,
} from "../controllers/aiTestController";
import transcriptionService from "../services/transcriptionService";

const router = express.Router();

// Route esistenti
router.post("/chat", chat);
router.post("/audio", processAudio);
router.post("/reset", resetConversation);

// Aggiungi questa nuova route per lo stato di Vosk
router.get("/vosk-status", (req: Request, res: Response) => {
  // Ottieni lo stato del servizio di trascrizione
  const status = transcriptionService.getStatus();
  res.json(status);
});

// Aggiungi questa nuova route per il menu
router.get("/menu", getMenu);

export default router;
