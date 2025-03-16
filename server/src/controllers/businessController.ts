import { Request, Response } from "express";
import Business from "../models/Business";
import Menu from "../models/Menu";
import User from "../models/User";

// Get all businesses for the authenticated user
export const getBusinesses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const businesses = await Business.find({ userId });

    res.json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error("Get businesses error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a specific business
export const getBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    const business = await Business.findById(id);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    // Verifica che il business appartenga all'utente autenticato
    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Get business error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new business
export const createBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authorized" });
      return;
    }

    // Controlla limiti del piano di abbonamento
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Conta quanti business ha già l'utente
    const businessCount = await Business.countDocuments({ userId });

    // Verifica limiti in base al piano di abbonamento
    if (user.subscriptionTier === "FREE" && businessCount >= 1) {
      res.status(403).json({
        success: false,
        message: "Free plan allows only 1 business. Upgrade to add more.",
      });
      return;
    }

    if (user.subscriptionTier === "BASIC" && businessCount >= 3) {
      res.status(403).json({
        success: false,
        message: "Basic plan allows up to 3 businesses. Upgrade to add more.",
      });
      return;
    }

    const business = new Business({
      ...req.body,
      userId,
    });

    await business.save();

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Create business error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a business
export const updateBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    let business = await Business.findById(id);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    // Verifica che il business appartenga all'utente autenticato
    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    business = await Business.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Update business error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a business
export const deleteBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const business = await Business.findById(id);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    // Verifica che il business appartenga all'utente autenticato
    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    await Business.findByIdAndDelete(id);
    // Elimina anche il menu associato
    await Menu.deleteMany({ businessId: id });

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete business error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get menu for a business
export const getMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menu = await Menu.findOne({ businessId: id, isActive: true });

    if (!menu) {
      res.status(404).json({ success: false, message: "Menu not found" });
      return;
    }

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Get menu error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create menu for a business
export const createMenu = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verifica che il business esista e appartenga all'utente
    const business = await Business.findById(id);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    // Verifica se esiste già un menu attivo
    const existingMenu = await Menu.findOne({ businessId: id, isActive: true });

    if (existingMenu) {
      // Disattiva il menu precedente
      existingMenu.isActive = false;
      await existingMenu.save();
    }

    // Crea il nuovo menu
    const menu = new Menu({
      ...req.body,
      businessId: id,
      isActive: true,
    });

    await menu.save();

    res.status(201).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Create menu error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update menu for a business
export const updateMenu = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verifica che il business esista e appartenga all'utente
    const business = await Business.findById(id);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    // Trova il menu attivo
    let menu = await Menu.findOne({ businessId: id, isActive: true });

    if (!menu) {
      res.status(404).json({ success: false, message: "Menu not found" });
      return;
    }

    // Aggiorna il menu
    menu = await Menu.findByIdAndUpdate(
      menu._id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Update menu error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
