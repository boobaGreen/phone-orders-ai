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

export const processText = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text, conversationId = uuidv4() } = req.body;

    // Recupera o inizializza la conversazione
    if (!conversations.has(conversationId)) {
      const systemPrompt = `Sei un assistente AI per la pizzeria "${
        testRestaurant.name
      }". 
Aiuta i clienti a ordinare dal nostro menu per il ritiro in negozio. 
Ecco il nostro menu completo organizzato per categorie:

${generateMenuText()}

Orari di apertura: 
${generateHoursText()}

IMPORTANTE: Ci concentriamo sul RITIRO IN NEGOZIO, non sulla consegna a domicilio.
Quando un cliente ordina, proponi sempre un orario di ritiro disponibile basato sugli orari di apertura e il tempo di preparazione (${
        testRestaurant.prepTime
      } minuti).
Il cliente può scegliere un orario diverso, in questo caso verifica che sia un orario valido durante l'apertura.

Ogni slot di ritiro è di ${
        testRestaurant.pickupTimeSlots
      } minuti e può contenere massimo ${testRestaurant.pickupMaxOrders} ordini.

Se un cliente chiede la consegna a domicilio, spiega gentilmente che offriamo solo il servizio di ritiro in negozio.`;

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

    // Estrai informazioni sull'ordine (questa funzione andrebbe implementata)
    extractOrderInfo(text, conversation);

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
      const systemPrompt = `Sei un assistente AI per la pizzeria "${
        testRestaurant.name
      }". 
Aiuta i clienti a ordinare dal nostro menu per il ritiro in negozio. 
Ecco il nostro menu completo organizzato per categorie:

${generateMenuText()}

Orari di apertura: 
${generateHoursText()}

IMPORTANTE: Ci concentriamo sul RITIRO IN NEGOZIO, non sulla consegna a domicilio.
Quando un cliente ordina, proponi sempre un orario di ritiro disponibile basato sugli orari di apertura e il tempo di preparazione (${
        testRestaurant.prepTime
      } minuti).
Il cliente può scegliere un orario diverso, in questo caso verifica che sia un orario valido durante l'apertura.

Ogni slot di ritiro è di ${
        testRestaurant.pickupTimeSlots
      } minuti e può contenere massimo ${testRestaurant.pickupMaxOrders} ordini.

Se un cliente chiede la consegna a domicilio, spiega gentilmente che offriamo solo il servizio di ritiro in negozio.`;

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

    // Estrai le informazioni sull'ordine
    extractOrderInfo(transcript, conversation);

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

// Migliora la funzione di estrazione dell'ordine

function extractOrderInfo(text: string, conversation: any): void {
  const lowerText = text.toLowerCase();
  const orderItems = conversation.orderItems || [];

  // Resetta l'ordine se viene richiesto un nuovo ordine
  if (
    lowerText.includes("nuovo ordine") ||
    lowerText.includes("ordine diverso")
  ) {
    conversation.orderItems = [];
    return;
  }

  // Cerca pattern come "2 margherita", "una diavola", ecc.
  testRestaurant.menu.forEach((menuItem) => {
    const itemNameLower = menuItem.name.toLowerCase();

    // Espressione regolare per catturare quantità e nomi di prodotti
    // Esempi: "2 margherita", "una diavola", "tre coca cola"
    const patterns = [
      new RegExp(`(\\d+)\\s*${itemNameLower}`, "i"),
      new RegExp(`(un|uno|una)\\s*${itemNameLower}`, "i"),
      new RegExp(`(due|2)\\s*${itemNameLower}`, "i"),
      new RegExp(`(tre|3)\\s*${itemNameLower}`, "i"),
      new RegExp(`(quattro|4)\\s*${itemNameLower}`, "i"),
      new RegExp(`(cinque|5)\\s*${itemNameLower}`, "i"),
    ];

    // Controlla ogni pattern
    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match) {
        let quantity = 1;
        const quantityText = match[1].toLowerCase();

        // Converti testo in numeri
        if (/^\d+$/.test(quantityText)) {
          quantity = parseInt(quantityText);
        } else {
          switch (quantityText) {
            case "un":
            case "uno":
            case "una":
              quantity = 1;
              break;
            case "due":
              quantity = 2;
              break;
            case "tre":
              quantity = 3;
              break;
            case "quattro":
              quantity = 4;
              break;
            case "cinque":
              quantity = 5;
              break;
          }
        }

        // Cerca se l'item è già nell'ordine
        const existingItemIndex = orderItems.findIndex(
          (item: any) => item.name.toLowerCase() === menuItem.name.toLowerCase()
        );

        if (existingItemIndex > -1) {
          // Aggiorna la quantità se l'item esiste già
          orderItems[existingItemIndex].quantity = quantity;
        } else {
          // Aggiungi un nuovo item all'ordine
          orderItems.push({
            name: menuItem.name,
            price: menuItem.price,
            quantity: quantity,
            category: menuItem.category,
          });
        }

        // Aggiorna l'ordine nella conversazione
        conversation.orderItems = orderItems;
        break;
      }
    }
  });

  return;
}

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

export default { processText, processAudio, resetConversation, getMenu };
export function chat(arg0: string, chat: any) {
  throw new Error("Function not implemented.");
}
