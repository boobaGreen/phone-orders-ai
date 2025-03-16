// User Types
export enum SubscriptionTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Business Types
export interface BusinessHours {
  day: number; // 0-6 (Sunday-Saturday)
  open: string; // HH:MM format
  close: string; // HH:MM format
  maxOrdersPerSlot: number;
}

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Business {
  _id: string;
  name: string;
  userId: string;
  address: BusinessAddress;
  phoneNumber: string;
  email: string;
  businessHours: BusinessHours[];
  slotDuration: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Menu Types
export interface MenuItemVariant {
  name: string;
  price: number;
}

export interface MenuItemOptionChoice {
  name: string;
  price: number;
}

export interface MenuItemOption {
  name: string;
  choices: MenuItemOptionChoice[];
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  variants?: MenuItemVariant[];
  options?: MenuItemOption[];
  isAvailable: boolean;
}

export interface Menu {
  _id: string;
  businessId: string;
  name: string;
  items: MenuItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface OrderItemOption {
  name: string;
  choice: string;
  price: number;
}

export interface OrderItemVariant {
  name: string;
  price: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options?: OrderItemOption[];
  variant?: OrderItemVariant;
  notes?: string;
}

export interface ConversationLogEntry {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Order {
  _id: string;
  businessId: string;
  customerPhone: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  pickupTime: string;
  notes?: string;
  conversationLog?: ConversationLogEntry[];
  createdAt: string;
  updatedAt: string;
}
