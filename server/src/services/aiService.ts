import axios from "axios";
import { config } from "../config";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export class AIService {
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor() {
    this.apiKey = config.deepSeek.apiKey || "";
    this.endpoint = config.deepSeek.endpoint;
    this.model = config.deepSeek.model;
  }

  // Verifica che questo metodo sia disponibile o implementalo
  async generateResponse(messages: Array<{ role: string; content: string }>) {
    try {
      console.log("=== INIZIO RICHIESTA AI ===");
      console.log("Timestamp:", new Date().toISOString());
      console.log("Numero di messaggi:", messages.length);
      console.log(
        "Ultimo messaggio:",
        messages[messages.length - 1]?.content?.substring(0, 100) + "..."
      );
      console.log(
        "Payload completo:",
        JSON.stringify(messages).substring(0, 500) + "..."
      );

      const startTime = Date.now();

      // La richiesta esistente all'API AI (DeepSeek, OpenAI, ecc.)
      const response = await axios.post(
        `${this.endpoint}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // Aumenta il timeout a 30 secondi
        }
      );

      const duration = Date.now() - startTime;
      console.log(`Risposta ricevuta in ${duration}ms`);
      console.log(
        "Prima parte della risposta:",
        response.data?.choices?.[0]?.message?.content?.substring(0, 100) + "..."
      );
      console.log("=== FINE RICHIESTA AI ===");

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error("=== ERRORE API AI ===");
      console.error("Tipo di errore:", error.name);
      console.error("Messaggio:", error.message);
      console.error("Stack:", error.stack);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Headers:", JSON.stringify(error.response.headers));
        console.error("Data:", JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error("Nessuna risposta ricevuta");
        console.error("Timeout?", error.code === "ECONNABORTED");
      } else {
        console.error("Errore di configurazione della richiesta");
      }

      console.error("=== FINE ERRORE API AI ===");

      // Gestione specifica dell'errore di timeout
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        throw new Error("La richiesta all'API AI è scaduta. Riprova tra poco.");
      }

      throw error;
    }
  }
}

export default new AIService();
