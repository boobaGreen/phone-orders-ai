import { Router } from "express";
import authRoutes from "./authRoutes";
import businessRoutes from "./businessRoutes";
import orderRoutes from "./orderRoutes";
import callRoutes from "./callRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/business", businessRoutes);
router.use("/orders", orderRoutes);
router.use("/call", callRoutes);

export default router;
