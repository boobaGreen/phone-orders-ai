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

  async generateResponse(messages: Message[]): Promise<string> {
    try {
      const response = await axios.post<DeepSeekResponse>(
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
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling DeepSeek API:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}

export default new AIService();
