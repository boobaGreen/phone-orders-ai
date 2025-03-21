import { Request, Response } from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import aiService from "../services/aiService";
import transcriptionService from "../services/transcriptionService";

// Aggiungi la definizione del menu di test
export const testRestaurant = {
  id: "pizzeria-test",
  name: "Pizzeria Test",
  menu: [
    // PIZZE
    {
      name: "Margherita",
      price: 7.5,
      description: "Pomodoro, mozzarella e basilico",
      category: "Pizze",
    },
    {
      name: "Diavola",
      price: 9.0,
      description: "Pomodoro, mozzarella e salame piccante",
      category: "Pizze",
    },
    {
      name: "Quattro Formaggi",
      price: 8.5,
      description: "Pomodoro, mozzarella e quattro formaggi",
      category: "Pizze",
    },
    {
      name: "Capricciosa",
      price: 10.0,
      description: "Pomodoro, mozzarella, funghi, carciofi, olive e prosciutto",
      category: "Pizze",
    },
    {
      name: "Bufalina",
      price: 9.5,
      description: "Pomodoro, mozzarella di bufala e basilico",
      category: "Pizze",
    },
    // PIADINE
    {
      name: "Piadina Crudo",
      price: 6.5,
      description: "Prosciutto crudo, mozzarella e rucola",
      category: "Piadine",
    },
    {
      name: "Piadina Vegetariana",
      price: 6.0,
      description: "Verdure grigliate e formaggio spalmabile",
      category: "Piadine",
    },
    // CRESCIONI
    {
      name: "Crescione al Formaggio",
      price: 5.5,
      description: "Ripieno di formaggio e spinaci",
      category: "Crescioni",
    },
    {
      name: "Crescione Rosso",
      price: 5.5,
      description: "Ripieno di pomodoro e mozzarella",
      category: "Crescioni",
    },
    // BEVANDE
    {
      name: "Coca Cola",
      price: 2.5,
      description: "Lattina 33cl",
      category: "Bevande",
    },
    {
      name: "Acqua Naturale",
      price: 1.5,
      description: "Bottiglia 50cl",
      category: "Bevande",
    },
    {
      name: "Birra Moretti",
      price: 3.5,
      description: "Bottiglia 33cl",
      category: "Bevande",
    },
  ],
  hours: {
    monday: { open: "12:00", close: "14:30", open2: "18:00", close2: "22:30" },
    tuesday: { open: "12:00", close: "14:30", open2: "18:00", close2: "22:30" },
    wednesday: {
      open: "12:00",
      close: "14:30",
      open2: "18:00",
      close2: "22:30",
    },
    thursday: {
      open: "12:00",
      close: "14:30",
      open2: "18:00",
      close2: "22:30",
    },
    friday: { open: "12:00", close: "14:30", open2: "18:00", close2: "23:00" },
    saturday: {
      open: "12:00",
      close: "15:00",
      open2: "18:00",
      close2: "23:00",
    },
    sunday: { open: "12:00", close: "15:00", open2: "18:00", close2: "22:30" },
  },
  pickupTimeSlots: 15, // minuti per slot
  pickupMaxOrders: 4, // ordini massimi per slot
  prepTime: 20, // tempo di preparazione in minuti
};

// Mantiene il contesto della conversazione
const conversations = new Map();

// Funzione helper per generare la stringa del menu
export function generateMenuText(): string {
  const menuByCategory = testRestaurant.menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(
      `${item.name} - €${item.price.toFixed(2)}\n${item.description}`
    );
    return acc;
  }, {} as Record<string, string[]>);

  return Object.entries(menuByCategory)
    .map(([category, items]) => `${category}:\n${items.join("\n")}`)
    .join("\n\n");
}

// Funzione helper per generare gli orari
export function generateHoursText(): string {
  return Object.entries(testRestaurant.hours)
    .map(
      ([day, hours]) =>
        `- ${day}: ${hours.open}-${hours.close}, ${hours.open2}-${hours.close2}`
    )
    .join("\n");
}

// Sostituisci extractOrderInfo con questa funzione
function extractOrderFromAIResponse(aiResponse: string): any[] {
  try {
    // Trova il blocco JSON nella risposta
    const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/);

    if (jsonMatch && jsonMatch[1]) {
      const jsonText = jsonMatch[1].trim();
      const orderData = JSON.parse(jsonText);

      if (orderData && Array.isArray(orderData.orderItems)) {
        console.log(
          "[AI JSON] Successfully extracted order:",
          orderData.orderItems
        );
        return orderData.orderItems;
      }
    }

    console.log("[AI JSON] No valid JSON order found in response");
    return [];
  } catch (error) {
    console.error("[AI JSON] Error parsing order JSON:", error);
    return [];
  }
}

// Verifica che questi due handler siano implementati correttamente
export const processText = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text, conversationId = uuidv4() } = req.body;

    // Log di debug
    console.log(`Processing text: "${text}"`, { conversationId });

    // Recupera o inizializza la conversazione
    if (!conversations.has(conversationId)) {
      const systemPrompt = `Sei l'assistente IA della pizzeria "${
        testRestaurant.name
      }". 
Aiuta i clienti a ordinare dal nostro menu per il ritiro in negozio. 

${generateMenuText()}

Orari di apertura: 
${generateHoursText()}

REGOLE IMPORTANTI PER GLI ORDINI:
1. Ogni slot da 15 minuti può accogliere massimo 10 pizze
2. Offri sempre un orario di ritiro disponibile in base al numero di pizze ordinate
3. Chiedi SEMPRE il nome del cliente, è OBBLIGATORIO per l'ordine
4. Se l'orario richiesto non ha capacità sufficiente, suggerisci l'orario libero più vicino
5. Conferma sempre l'ordine riepilogando: prodotti, prezzo totale, orario di ritiro e nome cliente

INFORMAZIONI SUGLI SLOT ORARI:
- Gli slot sono di 15 minuti: 18:00, 18:15, 18:30, ecc.
- Capacità attuale degli slot: 
  * 19:00-19:15: 4 pizze disponibili
  * 19:15-19:30: 8 pizze disponibili
  * 19:30-19:45: 10 pizze disponibili
  * 19:45-20:00: 10 pizze disponibili
  * 20:00-20:15: 5 pizze disponibili

DEVI RESTITUIRE UN OGGETTO JSON alla fine di ogni risposta, nel formato seguente:

\`\`\`json
{
  "orderItems": [
    {
      "name": "NomeProdotto",
      "quantity": NumeroIntero,
      "price": PrezzoProdotto,
      "category": "CategoriaProdotto"
    }
  ],
  "customer": {
    "name": "NomeCliente"
  },
  "pickup": {
    "time": "HH:MM",
    "slot": "HH:MM-HH:MM"
  },
  "totalAmount": PrezzoTotale
}
\`\`\`
`;

      conversations.set(conversationId, {
        messages: [
          {
            role: "system",
            content: systemPrompt,
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

    // Estrai ordine dal JSON incluso nella risposta AI
    const orderItems = extractOrderFromAIResponse(aiResponse);
    if (orderItems.length > 0) {
      conversation.orderItems = orderItems;
    }

    // Per debug, invia una versione pulita della risposta senza il JSON
    const cleanResponse = aiResponse.replace(/```json[\s\S]*?```/g, "").trim();

    res.status(200).json({
      conversationId,
      aiResponse: cleanResponse,
      currentOrder: conversation.orderItems,
    });
  } catch (error) {
    console.error("Errore nell'elaborazione del testo:", error);
    res.status(500).json({
      error: "Si è verificato un errore nell'elaborazione del testo",
    });
  }
};

export const handleAudioUpload = async (
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
      const systemPrompt = `Sei l'assistente IA della pizzeria "${
        testRestaurant.name
      }". 
Aiuta i clienti a ordinare dal nostro menu per il ritiro in negozio. 

${generateMenuText()}

Orari di apertura: 
${generateHoursText()}

REGOLE IMPORTANTI PER GLI ORDINI:
1. Ogni slot da 15 minuti può accogliere massimo 10 pizze
2. Offri sempre un orario di ritiro disponibile in base al numero di pizze ordinate
3. Chiedi SEMPRE il nome del cliente, è OBBLIGATORIO per l'ordine
4. Se l'orario richiesto non ha capacità sufficiente, suggerisci l'orario libero più vicino
5. Conferma sempre l'ordine riepilogando: prodotti, prezzo totale, orario di ritiro e nome cliente

INFORMAZIONI SUGLI SLOT ORARI:
- Gli slot sono di 15 minuti: 18:00, 18:15, 18:30, ecc.
- Capacità attuale degli slot: 
  * 19:00-19:15: 4 pizze disponibili
  * 19:15-19:30: 8 pizze disponibili
  * 19:30-19:45: 10 pizze disponibili
  * 19:45-20:00: 10 pizze disponibili
  * 20:00-20:15: 5 pizze disponibili

DEVI RESTITUIRE UN OGGETTO JSON alla fine di ogni risposta, nel formato seguente:

\`\`\`json
{
  "orderItems": [
    {
      "name": "NomeProdotto",
      "quantity": NumeroIntero,
      "price": PrezzoProdotto,
      "category": "CategoriaProdotto"
    }
  ],
  "customer": {
    "name": "NomeCliente"
  },
  "pickup": {
    "time": "HH:MM",
    "slot": "HH:MM-HH:MM"
  },
  "totalAmount": PrezzoTotale
}
\`\`\`
`;

      conversations.set(conversationId, {
        messages: [
          {
            role: "system",
            content: systemPrompt,
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

    // Estrai ordine dal JSON incluso nella risposta AI
    const orderItems = extractOrderFromAIResponse(aiResponse);
    if (orderItems.length > 0) {
      conversation.orderItems = orderItems;
    }

    // Per debug, invia una versione pulita della risposta senza il JSON
    const cleanResponse = aiResponse.replace(/```json[\s\S]*?```/g, "").trim();

    // Invia la risposta
    res.status(200).json({
      conversationId,
      transcript,
      aiResponse: cleanResponse,
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

// Aggiungi questa implementazione se manca
export const handleAudioBase64 = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { audio, conversationId } = req.body;

    if (!audio) {
      res.status(400).json({ error: "No audio data provided" });
      return;
    }

    // Converti da base64 a buffer
    const audioBuffer = Buffer.from(audio, "base64");

    // Salva temporaneamente il file
    const tempFilePath = path.join(
      __dirname,
      "../../uploads",
      `${Date.now()}.wav`
    );
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Trascrivi l'audio usando il servizio
    const transcript = await transcriptionService.transcribeAudio(tempFilePath);

    // Elimina il file temporaneo
    fs.unlinkSync(tempFilePath);

    // Processa la trascrizione come faresti normalmente

    // Il resto della tua logica di elaborazione con la trascrizione...
    // ...

    res.json({
      transcript,
      aiResponse: "Risposta processata con successo",
      conversationId: "some-conversation-id", // Sostituisci con l'ID reale
      currentOrder: [], // Sostituisci con l'ordine reale
    });
  } catch (error) {
    console.error("Error processing audio base64:", error);
    res.status(500).json({ error: "Failed to process audio" });
  }
};

export const resetConversation = (req: Request, res: Response): void => {
  const { conversationId } = req.params;

  if (conversationId && conversations.has(conversationId)) {
    conversations.delete(conversationId);
  }

  res.status(200).json({ success: true });
};

// Aggiungi anche l'endpoint per il menu
export const getMenu = (req: Request, res: Response): void => {
  res.json({
    success: true,
    menu: testRestaurant.menu,
  });
};

// Correzione per chat
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    // Usa la stessa logica di processText temporaneamente
    await processText(req, res);
  } catch (error) {
    console.error("Errore nella chat:", error);
    res.status(500).json({ error: "Si è verificato un errore nella chat" });
  }
};

export default {
  processText,
  handleAudioUpload,
  resetConversation,
  getMenu,
  handleAudioBase64,
  chat,
};
