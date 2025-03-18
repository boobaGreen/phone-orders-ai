import express, { Request, Response } from "express";
import multer from "multer";
import aiTestController, {
  chat,
  resetConversation,
  getMenu,
  // Assicurati che handleAudioBase64 sia esportato correttamente dal controller
  // Se non è esportato direttamente, rimuovi questa riga
} from "../controllers/aiTestController";
import transcriptionService from "../services/transcriptionService";
import { authenticate } from "../middleware/auth";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

// Route esistenti
router.post("/chat", chat);
router.post(
  "/audio",
  authenticate,
  upload.single("audio"),
  aiTestController.handleAudioUpload
);
router.post("/reset", resetConversation);

// Rimuovi questa riga che causa l'errore
// router.post("/audio-base64", authenticate, handleAudioBase64);

// Mantieni solo questa route per audio-base64
router.post("/audio-base64", authenticate, aiTestController.handleAudioBase64);

// Aggiungi questa nuova route per lo stato di Vosk
router.get("/vosk-status", (req: Request, res: Response) => {
  // Ottieni lo stato del servizio di trascrizione
  const status = transcriptionService.getStatus();
  res.json(status);
});

// Aggiungi questa nuova route per il menu
router.get("/menu", getMenu);

// Aggiungi la route per process-text che manca
router.post("/process-text", authenticate, aiTestController.processText);

// Aggiungi la route per eliminare una conversazione
router.delete(
  "/conversation/:id",
  authenticate,
  aiTestController.resetConversation
);

export default router;
