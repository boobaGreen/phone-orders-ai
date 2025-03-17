import { Router } from "express";
import aiTestController from "../controllers/aiTestController";

const router = Router();

router.post("/process-text", aiTestController.processText);
router.post("/process-audio", aiTestController.processAudio);
router.delete(
  "/conversation/:conversationId",
  aiTestController.resetConversation
);

export default router;
