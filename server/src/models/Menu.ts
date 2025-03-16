import mongoose, { Schema, Document } from "mongoose";

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  variants?: Array<{
    name: string;
    price: number;
  }>;
  options?: Array<{
    name: string;
    choices: Array<{
      name: string;
      price: number;
    }>;
  }>;
  isAvailable: boolean;
}

export interface IMenu extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  items: MenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  variants: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  options: [
    {
      name: { type: String, required: true },
      choices: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
        },
      ],
    },
  ],
  isAvailable: { type: Boolean, default: true },
});

const MenuSchema: Schema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true },
    items: [MenuItemSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMenu>("Menu", MenuSchema);
