import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.getMe); // Added authenticate middleware since this needs userId
router.post("/verify-supabase", authController.verifySupabaseToken);

export default router;
