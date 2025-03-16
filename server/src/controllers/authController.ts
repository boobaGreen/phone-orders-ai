import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import User, { SubscriptionTier } from "../models/User";
import { config } from "../config";

// Inizializza il client Supabase
const supabase = createClient(
  config.supabase.url || "",
  config.supabase.publicKey || ""
);

// Registra un nuovo utente (dopo auth con Supabase)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, supabaseId } = req.body;

    if (!email || !name || !supabaseId) {
      res.status(400).json({
        success: false,
        message: "Email, name, and supabaseId are required",
      });
      return;
    }

    // Verifica se l'utente esiste già
    let user = await User.findOne({ email });

    if (user) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    // Crea un nuovo utente
    user = new User({
      email,
      name,
      supabaseId,
      subscriptionTier: SubscriptionTier.FREE,
    });

    await user.save();

    // Genera token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      String(config.jwt.secret),
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login (verifica token Supabase e genera JWT)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supabaseToken } = req.body;

    if (!supabaseToken) {
      res.status(400).json({
        success: false,
        message: "Token is required",
      });
      return;
    }

    // Verifica il token Supabase
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(supabaseToken);

    if (error || !supabaseUser) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    // Trova l'utente nel nostro DB
    let user = await User.findOne({ supabaseId: supabaseUser.id });

    // Se l'utente non esiste, verifica se esiste un utente con la stessa email
    if (!user && supabaseUser.email) {
      user = await User.findOne({ email: supabaseUser.email });

      // Se esiste un utente con la stessa email ma senza supabaseId, aggiorna il record
      if (user && !user.supabaseId) {
        user.supabaseId = supabaseUser.id;
        await user.save();
      }
      // Se non esiste un utente con questa email, crealo
      else if (!user) {
        user = new User({
          email: supabaseUser.email,
          name:
            supabaseUser.user_metadata?.name ||
            supabaseUser.email?.split("@")[0],
          supabaseId: supabaseUser.id,
          subscriptionTier: SubscriptionTier.FREE,
        });

        await user.save();
      }
    }

    // Verifica che l'utente esista
    if (!user) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve or create user",
      });
      return;
    }

    // Genera token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      String(config.jwt.secret),
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user info
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        subscriptionEndDate: user.subscriptionEndDate,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verifica il token Supabase
export const verifySupabaseToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token is required",
      });
      return;
    }

    // Verifica il token Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
        error: error?.message,
      });
      return;
    }

    res.json({
      success: true,
      user: data.user,
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
