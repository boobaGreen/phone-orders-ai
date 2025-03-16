import mongoose, { Schema, Document } from "mongoose";

export interface BusinessHours {
  day: number; // 0-6 (Sunday-Saturday)
  open: string; // HH:MM format
  close: string; // HH:MM format
  maxOrdersPerSlot: number;
}

export interface IBusiness extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
  businessHours: BusinessHours[];
  slotDuration: number; // in minutes, default 15
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    businessHours: [
      {
        day: { type: Number, required: true }, // 0-6 (Sunday-Saturday)
        open: { type: String, required: true }, // HH:MM format
        close: { type: String, required: true }, // HH:MM format
        maxOrdersPerSlot: { type: Number, default: 4 },
      },
    ],
    slotDuration: { type: Number, default: 15 }, // in minutes
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBusiness>("Business", BusinessSchema);
