import { Request, Response } from "express";
import Order, { OrderStatus } from "../models/Order";
import Business from "../models/Business";
import redisService from "../services/redisService";
import { format } from "date-fns";

export const checkSlotAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { businessId, date, time } = req.query;

    if (!businessId || !date || !time) {
      res.status(400).json({
        success: false,
        message: "BusinessId, date and time are required",
      });
      return;
    }

    // Trova il business per ottenere maxOrdersPerSlot
    const business = await Business.findById(businessId);
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    // Ottieni il giorno della settimana dalla data
    const dateObj = new Date(date as string);
    const dayOfWeek = dateObj.getDay(); // 0-6 (Sunday-Saturday)

    // Trova le ore di lavoro per quel giorno
    const dayHours = business.businessHours.find((h) => h.day === dayOfWeek);

    if (!dayHours) {
      res.status(200).json({
        success: true,
        available: false,
        message: "Business is closed on this day",
      });
      return;
    }

    // Formatta la data nel formato utilizzato per le chiavi Redis
    const formattedDate = format(dateObj, "yyyy-MM-dd");

    // Controlla se lo slot è pieno
    const isFull = await redisService.isTimeSlotFull(
      businessId as string,
      formattedDate,
      time as string,
      dayHours.maxOrdersPerSlot
    );

    res.status(200).json({
      success: true,
      available: !isFull,
      maxOrdersPerSlot: dayHours.maxOrdersPerSlot,
    });
  } catch (error) {
    console.error("Error checking slot availability:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAvailableSlots = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { businessId, date } = req.query;

    if (!businessId || !date) {
      res.status(400).json({
        success: false,
        message: "BusinessId and date are required",
      });
      return;
    }

    // Trova il business per ottenere businessHours e slotDuration
    const business = await Business.findById(businessId);
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    // Formatta la data nel formato utilizzato per le chiavi Redis
    const formattedDate = format(new Date(date as string), "yyyy-MM-dd");

    // Ottieni tutti gli slot disponibili per quella data
    const availableSlots = await redisService.getAvailableTimeSlots(
      businessId as string,
      formattedDate,
      business.businessHours,
      business.slotDuration
    );

    res.status(200).json({
      success: true,
      slots: availableSlots,
    });
  } catch (error) {
    console.error("Error getting available slots:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all orders for a business
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore (userId aggiunto dal middleware di autenticazione)
    const userId = req.userId;
    const { businessId, status, startDate, endDate } = req.query;

    // Build query
    const query: any = {};

    if (businessId) {
      // Verify the user owns this business
      const business = await Business.findById(businessId);
      if (!business) {
        res.status(404).json({ success: false, message: "Business not found" });
        return;
      }

      if (business.userId.toString() !== userId) {
        res.status(403).json({ success: false, message: "Not authorized" });
        return;
      }

      query.businessId = businessId;
    } else {
      // If no businessId provided, get all orders for businesses owned by this user
      const businesses = await Business.find({ userId });
      const businessIds = businesses.map((b) => b._id);
      query.businessId = { $in: businessIds };
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate as string);
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .populate("businessId", "name"); // Populate business name

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a specific order
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore (userId aggiunto dal middleware di autenticazione)
    const userId = req.userId;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Verify the user owns this business
    const business = await Business.findById(order.businessId);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new order
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      businessId,
      customerPhone,
      customerName,
      items,
      totalAmount,
      pickupTime,
      notes,
    } = req.body;
    // @ts-ignore (userId aggiunto dal middleware di autenticazione)
    const userId = req.userId;

    // Verify the business exists and belongs to the user
    const business = await Business.findById(businessId);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    // Verify time slot is available
    const pickupDate = new Date(pickupTime);
    const formattedDate = format(pickupDate, "yyyy-MM-dd");
    const formattedTime = format(pickupDate, "HH:mm");

    const dayOfWeek = pickupDate.getDay();
    const dayHours = business.businessHours.find((h) => h.day === dayOfWeek);

    if (!dayHours) {
      res.status(400).json({
        success: false,
        message: "Business is closed on this day",
      });
      return;
    }

    const isFull = await redisService.isTimeSlotFull(
      businessId,
      formattedDate,
      formattedTime,
      dayHours.maxOrdersPerSlot
    );

    if (isFull) {
      res.status(400).json({
        success: false,
        message: "Selected time slot is no longer available",
      });
      return;
    }

    // Create the order
    const order = new Order({
      businessId,
      customerPhone,
      customerName,
      items,
      totalAmount,
      pickupTime: pickupDate,
      notes,
      status: OrderStatus.PENDING,
    });

    await order.save();

    // Update the time slot availability
    await redisService.incrementTimeSlot(
      businessId,
      formattedDate,
      formattedTime
    );

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update an order
export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, pickupTime, items, totalAmount, notes } = req.body;
    // @ts-ignore (userId aggiunto dal middleware di autenticazione)
    const userId = req.userId;

    // Find the order
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Verify the user owns this business
    const business = await Business.findById(order.businessId);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    // Handle time slot changes if pickup time is changed
    if (
      pickupTime &&
      new Date(pickupTime).getTime() !== new Date(order.pickupTime).getTime()
    ) {
      // Decrement old time slot
      const oldDate = format(new Date(order.pickupTime), "yyyy-MM-dd");
      const oldTime = format(new Date(order.pickupTime), "HH:mm");
      await redisService.decrementTimeSlot(
        order.businessId.toString(),
        oldDate,
        oldTime
      );

      // Check if new time slot is available
      const newPickupDate = new Date(pickupTime);
      const newDate = format(newPickupDate, "yyyy-MM-dd");
      const newTime = format(newPickupDate, "HH:mm");

      const dayOfWeek = newPickupDate.getDay();
      const dayHours = business.businessHours.find((h) => h.day === dayOfWeek);

      if (!dayHours) {
        res.status(400).json({
          success: false,
          message: "Business is closed on the selected day",
        });
        return;
      }

      const isFull = await redisService.isTimeSlotFull(
        order.businessId.toString(),
        newDate,
        newTime,
        dayHours.maxOrdersPerSlot
      );

      if (isFull) {
        res.status(400).json({
          success: false,
          message: "Selected time slot is no longer available",
        });
        return;
      }

      // Increment new time slot
      await redisService.incrementTimeSlot(
        order.businessId.toString(),
        newDate,
        newTime
      );
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: status || order.status,
        pickupTime: pickupTime || order.pickupTime,
        items: items || order.items,
        totalAmount: totalAmount || order.totalAmount,
        notes: notes !== undefined ? notes : order.notes,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete an order
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore (userId aggiunto dal middleware di autenticazione)
    const userId = req.userId;

    // Find the order
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Verify the user owns this business
    const business = await Business.findById(order.businessId);

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    if (business.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }

    // Decrement time slot before deleting
    const date = format(new Date(order.pickupTime), "yyyy-MM-dd");
    const time = format(new Date(order.pickupTime), "HH:mm");
    await redisService.decrementTimeSlot(
      order.businessId.toString(),
      date,
      time
    );

    // Delete the order
    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
