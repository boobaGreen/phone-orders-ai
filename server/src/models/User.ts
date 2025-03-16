import mongoose, { Schema, Document } from "mongoose";

export enum SubscriptionTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
}

export interface IUser extends Document {
  email: string;
  name: string;
  supabaseId: string;
  subscriptionTier: SubscriptionTier;
  subscriptionEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    supabaseId: { type: String, required: true, unique: true },
    subscriptionTier: {
      type: String,
      enum: Object.values(SubscriptionTier),
      default: SubscriptionTier.FREE,
    },
    subscriptionEndDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
