import { Router } from "express";
import * as orderController from "../controllers/orderController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Availability routes - these must come before /:id routes
router.get("/slot/check", orderController.checkSlotAvailability);
router.get("/slot/available", orderController.getAvailableSlots);

// Order routes - these must come after more specific routes
router.get("/", authenticate, orderController.getOrders);
router.post("/", authenticate, orderController.createOrder);
router.get("/:id", authenticate, orderController.getOrder);
router.put("/:id", authenticate, orderController.updateOrder);
router.delete("/:id", authenticate, orderController.deleteOrder);

export default router;
