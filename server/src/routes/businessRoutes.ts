import { Router } from "express";
import * as businessController from "../controllers/businessController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Business routes (tutti protetti da autenticazione)
router.get("/", authenticate, businessController.getBusinesses);
router.get("/:id", authenticate, businessController.getBusiness);
router.post("/", authenticate, businessController.createBusiness);
router.put("/:id", authenticate, businessController.updateBusiness);
router.delete("/:id", authenticate, businessController.deleteBusiness);

// Menu routes
router.get("/:id/menu", authenticate, businessController.getMenu);
router.post("/:id/menu", authenticate, businessController.createMenu);
router.put("/:id/menu", authenticate, businessController.updateMenu);

export default router;
