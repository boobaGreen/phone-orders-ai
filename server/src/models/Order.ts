import mongoose, { Schema, Document } from "mongoose";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface OrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  options?: Array<{
    name: string;
    choice: string;
    price: number;
  }>;
  variant?: {
    name: string;
    price: number;
  };
  notes?: string;
}

export interface IOrder extends Document {
  businessId: mongoose.Types.ObjectId;
  customerPhone: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  pickupTime: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  conversationLog?: Array<{
    role: "system" | "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
}

const OrderSchema: Schema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    customerPhone: { type: String, required: true },
    customerName: { type: String, required: true },
    items: [
      {
        menuItemId: { type: Schema.Types.ObjectId, ref: "Menu.items" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        options: [
          {
            name: { type: String, required: true },
            choice: { type: String, required: true },
            price: { type: Number, required: true },
          },
        ],
        variant: {
          name: { type: String },
          price: { type: Number },
        },
        notes: { type: String },
      },
    ],
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    totalAmount: { type: Number, required: true },
    pickupTime: { type: Date, required: true },
    notes: { type: String },
    conversationLog: [
      {
        role: {
          type: String,
          enum: ["system", "user", "assistant"],
          required: true,
        },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
