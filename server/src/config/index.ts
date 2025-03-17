import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  db: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/pizzeria-saas",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  deepSeek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    endpoint: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    publicKey: process.env.SUPABASE_PUBLIC_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  vosk: {
    modelPath:
      process.env.VOSK_MODEL_PATH || "./models/vosk-model-small-it-0.22",
  },
};
