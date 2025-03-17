import { Request, Response } from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import aiService from "../services/aiService";
import transcriptionService from "../services/transcriptionService";

// Dati hardcodati del ristorante per i test
const testRestaurant = {
  id: "pizzeria-test",
  name: "Pizzeria Test",
  menu: [
    {
      name: "Margherita",
      price: 7.5,
      description: "Pomodoro, mozzarella e basilico",
    },
    {
      name: "Diavola",
      price: 9.0,
      description: "Pomodoro, mozzarella e salame piccante",
    },
    {
      name: "Quattro Formaggi",
      price: 8.5,
      description: "Pomodoro, mozzarella e quattro formaggi",
    },
  ],
  hours: {
    monday: { open: "12:00", close: "23:00" },
    tuesday: { open: "12:00", close: "23:00" },
    wednesday: { open: "12:00", close: "23:00" },
    thursday: { open: "12:00", close: "23:00" },
    friday: { open: "12:00", close: "00:00" },
    saturday: { open: "12:00", close: "00:00" },
    sunday: { open: "12:00", close: "23:00" },
  },
  deliveryTime: 30, // minuti
};

// Mantiene il contesto della conversazione
const conversations = new Map();

export const processText = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text, conversationId = uuidv4() } = req.body;

    // Recupera o inizializza la conversazione
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, {
        messages: [
          {
            role: "system",
            content: `Sei un assistente AI per la pizzeria "${
              testRestaurant.name
            }". 
            Aiuta i clienti a ordinare dal nostro menu. Ecco il nostro menu completo:
            ${JSON.stringify(testRestaurant.menu, null, 2)}
            Orari di apertura: ${JSON.stringify(testRestaurant.hours, null, 2)}
            Tempo di consegna stimato: ${testRestaurant.deliveryTime} minuti.`,
          },
        ],
        orderItems: [],
      });
    }

    const conversation = conversations.get(conversationId);

    // Aggiungi il messaggio dell'utente alla conversazione
    conversation.messages.push({
      role: "user",
      content: text,
    });

    // Ottieni risposta dall'AI
    const aiResponse = await aiService.generateResponse(conversation.messages);

    // Aggiungi la risposta alla conversazione
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    // Estrai informazioni sull'ordine (questa funzione andrebbe implementata)
    extractOrderInfo(text, conversation.orderItems);

    res.status(200).json({
      conversationId,
      aiResponse,
      currentOrder: conversation.orderItems,
    });
  } catch (error) {
    console.error("Errore nell'elaborazione del testo:", error);
    res.status(500).json({
      error: "Si è verificato un errore nell'elaborazione del testo",
    });
  }
};

export const processAudio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Configura formidable per l'upload del file
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limite
      keepExtensions: true,
    });

    // Parsing del form
    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    console.log("Form fields:", fields);
    console.log("Form files:", files);

    // Ottieni il file audio
    const audioFile =
      files.audio &&
      (Array.isArray(files.audio) ? files.audio[0] : files.audio);

    // Ottieni l'ID della conversazione o crea uno nuovo
    const conversationId =
      (fields.conversationId &&
        (Array.isArray(fields.conversationId)
          ? fields.conversationId[0]
          : String(fields.conversationId))) ||
      uuidv4();

    if (!audioFile) {
      res.status(400).json({ error: "Nessun file audio fornito" });
      return;
    }

    // Ottieni il percorso del file audio
    const audioPath = audioFile.filepath || (audioFile as any).path;
    const audioSize = audioFile.size;
    const audioType = audioFile.mimetype || (audioFile as any).type;

    console.log(
      `Audio received: ${audioPath}, Size: ${audioSize}, Type: ${audioType}`
    );

    // Log dettagliato
    console.log("---------- TRASCRIZIONE AUDIO ----------");
    console.log(`Audio ricevuto: ${audioPath}, Dimensione: ${audioSize} byte`);

    // Usa il servizio di trascrizione per convertire l'audio in testo
    let transcript;
    try {
      transcript = await transcriptionService.transcribeAudio(audioPath);
      console.log(`Trascrizione ottenuta: "${transcript}"`);

      if (!transcript || transcript.trim().length === 0) {
        console.log("Trascrizione vuota, usando fallback");
        transcript =
          "Non sono riuscito a comprendere l'audio, potresti ripetere?";
      }
    } catch (error) {
      console.error("Error during transcription:", error);
      transcript =
        "Non sono riuscito a comprendere l'audio, potresti ripetere?";
    }

    // Recupera o inizializza la conversazione
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, {
        messages: [
          {
            role: "system",
            content: `Sei un assistente AI per la pizzeria "${
              testRestaurant.name
            }". 
            Aiuta i clienti a ordinare dal nostro menu. Ecco il nostro menu completo:
            ${JSON.stringify(testRestaurant.menu, null, 2)}
            Orari di apertura: ${JSON.stringify(testRestaurant.hours, null, 2)}
            Tempo di consegna stimato: ${testRestaurant.deliveryTime} minuti.`,
          },
        ],
        orderItems: [],
      });
    }

    const conversation = conversations.get(conversationId);

    // Aggiungi la trascrizione come messaggio dell'utente
    conversation.messages.push({
      role: "user",
      content: transcript,
    });

    // Ottieni la risposta dall'AI
    let aiResponse;
    try {
      aiResponse = await aiService.generateResponse(conversation.messages);
    } catch (aiError) {
      console.error("Errore nel servizio AI:", aiError);
      aiResponse =
        "Mi dispiace, sto riscontrando problemi tecnici. Come posso aiutarti con il tuo ordine?";
    }

    // Aggiungi la risposta dell'AI alla conversazione
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    // Estrai le informazioni sull'ordine
    extractOrderInfo(transcript, conversation.orderItems);

    // Invia la risposta
    res.status(200).json({
      conversationId,
      transcript,
      aiResponse,
      currentOrder: conversation.orderItems,
    });

    // Pulisci il file temporaneo dopo l'uso
    try {
      fs.unlinkSync(audioPath);
    } catch (unlinkError) {
      console.error("Errore nella pulizia del file temporaneo:", unlinkError);
    }
  } catch (error) {
    console.error("Errore nell'elaborazione dell'audio:", error);
    res.status(500).json({
      error: "Si è verificato un errore nell'elaborazione dell'audio",
    });
  }
};

// Funzione per estrarre informazioni sull'ordine dal testo
function extractOrderInfo(text: string, orderItems: any[]) {
  // Implementazione base - da migliorare con NLP più avanzato
  const lowerText = text.toLowerCase();

  testRestaurant.menu.forEach((item) => {
    if (lowerText.includes(item.name.toLowerCase())) {
      // Cerca eventuali numeri per la quantità
      const quantityMatch = lowerText.match(
        /(\d+)\s*(?:pizze|pizza)\s*(?:margherita|diavola|quattro formaggi)/i
      );
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

      orderItems.push({
        name: item.name,
        price: item.price,
        quantity: quantity,
      });
    }
  });
}

export const resetConversation = (req: Request, res: Response): void => {
  const { conversationId } = req.params;

  if (conversationId && conversations.has(conversationId)) {
    conversations.delete(conversationId);
  }

  res.status(200).json({ success: true });
};

export default { processText, processAudio, resetConversation };
export function chat(arg0: string, chat: any) {
  throw new Error("Function not implemented.");
}
