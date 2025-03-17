import express, { Request, Response } from "express";
import * as aiTestController from "../controllers/aiTestController";
import transcriptionService from "../services/transcriptionService";

const router = express.Router();

// Route esistenti
router.post("/chat", aiTestController.chat);
router.post("/audio", aiTestController.processAudio);
router.post("/reset", aiTestController.resetConversation);

// Aggiungi questa nuova route per lo stato di Vosk
router.get("/vosk-status", (req: Request, res: Response) => {
  // Ottieni lo stato del servizio di trascrizione
  const status = transcriptionService.getStatus();
  res.json(status);
});

export default router;
