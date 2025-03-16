import twilio from "twilio";
import { config } from "../config";
import aiService from "./aiService";
import Order from "../models/Order";
import Business from "../models/Business";
import Menu from "../models/Menu";

class TwilioService {
  private client: twilio.Twilio;
  private phoneNumber: string;

  constructor() {
    const { accountSid, authToken, phoneNumber } = config.twilio;
    this.client = twilio(accountSid, authToken);
    this.phoneNumber = phoneNumber || "";
  }

  async handleIncomingCall(customerPhone: string, businessId: string) {
    try {
      // Find business details
      const business = await Business.findById(businessId);
      if (!business) {
        throw new Error("Business not found");
      }

      // Get menu for the business
      const menu = await Menu.findOne({ businessId, isActive: true });

      // Initial system prompt for the AI
      const systemPrompt = {
        role: "system" as const,
        content: `You are a friendly assistant for ${
          business.name
        }, a pizza restaurant. 
                  You're taking a phone order. Be conversational but efficient. 
                  Ask for customer name, what they'd like to order, and when they want to pick it up. 
                  Offer available time slots. The restaurant is open ${this.formatBusinessHours(
                    business.businessHours
                  )}.
                  Available menu items: ${this.formatMenuItems(
                    menu?.items || []
                  )}. 
                  Be helpful and confirm details before finalizing the order.`,
      };

      // Create a new order with initial conversation log
      const order = new Order({
        businessId,
        customerPhone,
        customerName: "", // Will be filled during conversation
        items: [],
        totalAmount: 0,
        pickupTime: new Date(), // Will be updated during conversation
        conversationLog: [systemPrompt],
      });

      await order.save();

      // Return TwiML for initial greeting
      return this.generateTwiML(
        "Hello! Thanks for calling. How can I help you today?",
        order._id instanceof Object ? order._id.toString() : String(order._id)
      );
    } catch (error) {
      console.error("Error handling incoming call:", error);
      return this.generateTwiML(
        "I'm sorry, there was an error processing your call. Please try again later."
      );
    }
  }

  async processVoiceInput(orderId: string, customerInput: string) {
    try {
      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Add customer message to conversation log
      order.conversationLog?.push({
        role: "user",
        content: customerInput,
        timestamp: new Date(),
      });

      // Get AI response based on conversation history
      const aiResponse = await aiService.generateResponse(
        order.conversationLog?.map((log) => ({
          role: log.role,
          content: log.content,
        })) || []
      );

      // Add AI response to conversation log
      order.conversationLog?.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      });

      await order.save();

      // Return TwiML with AI response
      return this.generateTwiML(aiResponse, orderId);
    } catch (error) {
      console.error("Error processing voice input:", error);
      return this.generateTwiML(
        "I'm sorry, I didn't catch that. Could you please repeat?",
        orderId
      );
    }
  }

  public generateTwiML(message: string, orderId?: string) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: "Polly.Joanna" }, message);

    if (orderId) {
      twiml.gather({
        input: ["speech"],
        action: `/api/call/response?orderId=${orderId}`,
        method: "POST",
        speechTimeout: "auto",
        language: "en-US",
      });
    }

    return twiml.toString();
  }

  public generateErrorResponse(message: string): string {
    return this.generateTwiML(message);
  }

  private formatBusinessHours(hours: any[]) {
    // Format business hours for the AI prompt
    return hours
      .map((h) => {
        const day = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][h.day];
        return `${day}: ${h.open} - ${h.close}`;
      })
      .join(", ");
  }

  private formatMenuItems(items: any[]) {
    // Format menu items for the AI prompt
    return items
      .map((item) => {
        return `${item.name} (${item.price}€) - ${item.description || ""}`;
      })
      .join(", ");
  }
}

export default new TwilioService();
