import Redis from "ioredis";
import { config } from "../config";

class RedisService {
  private client!: Redis; // Aggiungi ! per dire a TypeScript che questa proprietà sarà sicuramente inizializzata
  isConnected: boolean = false;

  constructor() {
    try {
      // Se REDIS_URL è fornito (come su Railway), usa quello
      if (process.env.REDIS_URL) {
        console.log("Connecting to Redis using URL configuration");
        this.client = new Redis(process.env.REDIS_URL);
      } else {
        // Altrimenti usa host e porta separati (configurazione locale)
        console.log("Connecting to Redis using host/port configuration");
        this.client = new Redis({
          host: config.redis.host,
          port: config.redis.port,
        });
      }

      // Gestione eventi
      this.client.on("error", (err) => {
        console.error("Redis Client Error", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("Redis Client Connected");
        this.isConnected = true;
      });

      this.client.on("reconnecting", () => {
        console.log("Redis Client Reconnecting");
      });
    } catch (error) {
      console.error("Error initializing Redis client:", error);
      this.isConnected = false;
      // Inizializza client a un valore di fallback per evitare errori nulli
      this.client = new Redis({ lazyConnect: true }); // Non si connetterà effettivamente
    }
  }

  async set(key: string, value: string, expireTime?: number): Promise<void> {
    if (expireTime) {
      await this.client.set(key, value, "EX", expireTime);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async getTimeSlotAvailability(
    businessId: string,
    date: string,
    time: string
  ): Promise<number> {
    const key = `slots:${businessId}:${date}:${time}`;
    const count = await this.client.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementTimeSlot(
    businessId: string,
    date: string,
    time: string
  ): Promise<number> {
    const key = `slots:${businessId}:${date}:${time}`;
    return this.client.incr(key);
  }

  async decrementTimeSlot(
    businessId: string,
    date: string,
    time: string
  ): Promise<number> {
    const key = `slots:${businessId}:${date}:${time}`;
    return this.client.decr(key);
  }

  // Verifica se uno slot è pieno
  async isTimeSlotFull(
    businessId: string,
    date: string,
    time: string,
    maxCapacity: number
  ): Promise<boolean> {
    const currentCount = await this.getTimeSlotAvailability(
      businessId,
      date,
      time
    );
    return currentCount >= maxCapacity;
  }

  // Ottieni tutti gli slot disponibili per una data
  async getAvailableTimeSlots(
    businessId: string,
    date: string,
    businessHours: any[],
    slotDuration: number
  ): Promise<{ time: string; available: boolean }[]> {
    const dayOfWeek = new Date(date).getDay();
    const todayHours = businessHours.find((h) => h.day === dayOfWeek);

    if (!todayHours) {
      return []; // Il business è chiuso questo giorno
    }

    const slots: { time: string; available: boolean }[] = [];
    const [openHour, openMinute] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMinute] = todayHours.close.split(":").map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    // Genera tutti gli slot possibili tra orario apertura e chiusura
    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMinute < closeMinute)
    ) {
      const timeSlot = `${String(currentHour).padStart(2, "0")}:${String(
        currentMinute
      ).padStart(2, "0")}`;

      const count = await this.getTimeSlotAvailability(
        businessId,
        date,
        timeSlot
      );
      const isAvailable = count < todayHours.maxOrdersPerSlot;

      slots.push({
        time: timeSlot,
        available: isAvailable,
      });

      // Avanza al prossimo slot
      currentMinute += slotDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute %= 60;
      }
    }

    return slots;
  }
}

export default new RedisService();
