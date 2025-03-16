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
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    // Set userId in request object
    req.userId = decoded.id;

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
};
