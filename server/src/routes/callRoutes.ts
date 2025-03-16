import { Router } from "express";
import * as callController from "../controllers/callController";

const router = Router();

// Twilio call handling
router.post("/incoming", callController.handleIncomingCall);
router.post("/response", callController.handleCallResponse);

export default router;
