import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

// Extend the Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Middleware per verificare il token JWT
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log(`[AUTH] Richiesta: ${req.method} ${req.originalUrl}`);

  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  console.log(
    `[AUTH] Header Authorization: ${authHeader ? "presente" : "assente"}`
  );

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("[AUTH] Token mancante nella richiesta");
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
    console.log(`[AUTH] Token valido, userId: ${decoded.id}`);

    // Set userId in request object
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("[AUTH] Token non valido:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
};
