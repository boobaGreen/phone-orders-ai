/* eslint-disable no-useless-escape */
/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Mic, MicOff, Send, RefreshCw } from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import api from "../services/api";
import { OrderStatus } from "../types";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

// // Aggiungi questa interfaccia per gli stati dell'ordine
// interface OrderState {
//   id: string;
//   status: "received" | "viewed" | "preparing" | "ready" | "picked-up";
//   timestamp: string;
// }

// Add these declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AiTestPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Benvenuto alla Pizzeria Demo. Come posso aiutarti?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isVoskReady, setIsVoskReady] = useState(false);
  const [, setLoadingMessage] = useState("");
  const [browserSupportsSTT, setBrowserSupportsSTT] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Aggiungi un nuovo stato per il menu
  const [showMenu, setShowMenu] = useState(false);
  const [testMenu, setTestMenu] = useState<
    { category: string; items: any[] }[]
  >([]);

  // Aggiungi questi stati
  const [proposedOrder, setProposedOrder] = useState<OrderItem[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderItem[]>([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Sposta questo stato fuori dal componente SlotAvailabilityDisplay
  const [slots, setSlots] = useState([
    { time: "19:00-19:15", capacity: 10, available: 4 },
    { time: "19:15-19:30", capacity: 10, available: 8 },
    { time: "19:30-19:45", capacity: 10, available: 10 },
    { time: "19:45-20:00", capacity: 10, available: 10 },
    { time: "20:00-20:15", capacity: 10, available: 5 },
  ]);

  useEffect(() => {
    // Quando gli slot cambiano, aggiorna il messaggio di sistema
    if (messages.length > 0 && messages[0].role === "system") {
      // Crea un messaggio di sistema aggiornato con gli slot correnti
      const slotsInfo = slots
        .map((slot) => `  * ${slot.time}: ${slot.available} pizze disponibili`)
        .join("\n");

      const systemMessage = `Sei l'assistente IA della pizzeria "Pizzeria Demo". 
Aiuta i clienti a ordinare dal nostro menu per il ritiro in negozio.

Orari di apertura: 18:00-22:00

REGOLE IMPORTANTI PER GLI ORDINI:
1. CHIEDI IMMEDIATAMENTE IL NOME AL CLIENTE SE NON L'HA FORNITO
2. Il nome cliente è OBBLIGATORIO per completare qualsiasi ordine
3. NON PRESUMERE MAI IL NOME DEL CLIENTE
4. Ogni slot da 15 minuti può accogliere massimo 10 pizze
5. Offri sempre un orario di ritiro disponibile in base al numero di pizze ordinate
6. Se l'orario richiesto non ha capacità sufficiente, suggerisci l'orario libero più vicino
7. Usa un tono positivo: quando uno slot ha abbastanza spazio, dì "ottimo" o "perfetto" invece di "purtroppo"
8. Interpreta formati orari abbreviati: se il cliente dice "19-19:15", intende "19:00-19:15"
9. TERMINA SEMPRE CON "Confermo l'ordine?" dopo aver fatto il riepilogo
10. NON PROCEDERE MAI SENZA CONFERMA ESPLICITA DEL CLIENTE

INFORMAZIONI SUGLI SLOT ORARI:
- Gli slot sono di 15 minuti
- Capacità attuale degli slot: 
${slotsInfo}

RICHIEDI SEMPRE LA CONFERMA ESPLICITA DELL'ORDINE.
DOPO LA CONFERMA, INCLUDI SEMPRE QUESTI DETTAGLI NELLA TUA RISPOSTA:
- Nome cliente (che deve essere stato richiesto in precedenza)
- Orario di ritiro
- Elenco completo dei prodotti
- Prezzo totale`;

      // Sostituisci il primo messaggio (sistema)
      setMessages((prev) => [
        { role: "system", content: systemMessage },
        ...prev.slice(1),
      ]);
    }
  }, [slots]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup media resources on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Check Vosk status
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const checkVoskStatus = async () => {
      try {
        const response = await api.get("/ai-test/vosk-status");
        const { ready, downloadProgress } = response.data;

        // Se il modello è pronto, aggiorna lo stato e interrompi il polling
        if (ready) {
          setIsVoskReady(true);
          setLoadingMessage("");
          // Importante: ferma il polling quando il modello è pronto
          if (interval) {
            console.log("Vosk model ready, stopping polling");
            clearInterval(interval);
          }
        } else if (downloadProgress < 100) {
          setLoadingMessage(
            `Preparazione modello vocale: ${downloadProgress}%`
          );
        } else {
          setLoadingMessage("Inizializzazione modello vocale...");
        }
      } catch (error) {
        console.error("Errore nel controllo dello stato di Vosk:", error);
      }
    };

    // Controlla una volta all'inizio
    checkVoskStatus();

    // Inizia il polling solo se Vosk non è ancora pronto
    if (!isVoskReady) {
      console.log("Starting Vosk polling");
      interval = setInterval(checkVoskStatus, 5000); // Aumenta l'intervallo a 5 secondi
    }

    // Cleanup: ferma il polling quando il componente viene smontato
    return () => {
      if (interval) {
        console.log("Cleaning up Vosk polling");
        clearInterval(interval);
      }
    };
  }, [isVoskReady]); // Importante: aggiungi isVoskReady come dipendenza

  // Carica il menu di test
  useEffect(() => {
    const fetchTestMenu = async () => {
      try {
        // Aggiornato da axios a api
        const response = await api.get("/ai-test/menu");
        if (response.data.menu) {
          // Organizza il menu per categorie
          const menuByCategory: Record<string, any[]> = {};
          response.data.menu.forEach((item: any) => {
            if (!menuByCategory[item.category]) {
              menuByCategory[item.category] = [];
            }
            menuByCategory[item.category].push(item);
          });

          // Converti in array per il rendering
          const formattedMenu = Object.entries(menuByCategory).map(
            ([category, items]) => ({
              category,
              items,
            })
          );

          setTestMenu(formattedMenu);
        }
      } catch (error) {
        console.error("Errore nel caricamento del menu di test:", error);
      }
    };

    fetchTestMenu();
  }, []);

  // Controlla il supporto del browser per Web Speech API
  useEffect(() => {
    // Verifica se il browser supporta Web Speech API
    const isWebSpeechSupported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

    setBrowserSupportsSTT(isWebSpeechSupported);

    // Se il browser non supporta Web Speech API, imposta anche isVoskReady a true
    // per permettere altre funzionalità dell'applicazione
    if (!isWebSpeechSupported) {
      setIsVoskReady(true);
    }
  }, []);

  // Funzione per avviare/fermare la registrazione
  const toggleRecording = async () => {
    // Se l'ordine è già confermato, blocca la registrazione
    if (orderConfirmed && confirmedOrder.length > 0) {
      alert(
        "L'ordine è già confermato. Per un nuovo ordine, clicca su 'Nuova Conversazione'."
      );
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      } else if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        // Check if SpeechRecognition is available
        if (
          "webkitSpeechRecognition" in window ||
          "SpeechRecognition" in window
        ) {
          // Use browser's speech recognition (Chrome/Edge)
          const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;

          // Configure recognition
          recognition.lang = "it-IT";
          recognition.continuous = false;
          recognition.interimResults = false;

          // Handle results
          recognition.onresult = (event: {
            results: { transcript: any }[][];
          }) => {
            const transcript = event.results[0][0].transcript;
            handleTranscription(transcript);
          };

          // Handle errors and end
          recognition.onerror = (event: { error: any }) => {
            console.error("Errore nel riconoscimento vocale:", event.error);
            setIsRecording(false);
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          // Start recording
          recognition.start();
          setIsRecording(true);
        } else {
          // Fallback per Firefox: registra audio e invialo al server
          console.log(
            "Web Speech API not supported, using MediaRecorder fallback"
          );

          // Clean up existing stream if any
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });
            processAudio(audioBlob);

            // Stop tracks after processing
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
            }
          };

          mediaRecorder.start();
          setIsRecording(true);
        }
      } catch (err) {
        console.error("Errore nell'accesso al microfono:", err);
        alert(
          "Impossibile accedere al microfono. Verifica le autorizzazioni del browser."
        );
      }
    }
  };

  const handleTranscription = async (transcript: string) => {
    setIsLoading(true);

    // Show the transcript immediately
    setMessages((prev) => [...prev, { role: "user", content: transcript }]);

    try {
      const response: {
        data: {
          aiResponse: string;
          transcript: string;
          conversationId: string;
          currentOrder?: OrderItem[];
        };
      } = await api.post("/ai-test/process-text", {
        text: transcript,
        conversationId,
      });

      const {
        aiResponse,
        transcript: receivedTranscript,
        conversationId: newConversationId,
        currentOrder: newOrder,
      } = response.data;

      // Importante: aggiorna l'ID conversazione se è nuovo
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
      }

      // Aggiorna l'ordine corrente con i nuovi elementi
      if (newOrder) {
        console.log("Aggiornamento ordine:", newOrder);
        setCurrentOrder(newOrder);
      }

      // Aggiorna i messaggi con la trascrizione e la risposta AI
      setMessages((prev) => [
        ...prev,
        { role: "user", content: receivedTranscript },
        { role: "assistant", content: aiResponse },
      ]);
    } catch (err) {
      console.error("Errore nell'elaborazione del testo:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Si è verificato un errore nell'elaborazione del messaggio. Riprova.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Modifica la funzione processAudio per usare l'URL completo del backend
  async function processAudio(audioBlob: Blob) {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("conversationId", conversationId || "new");

      // Usa l'instanza api invece di axios direttamente
      const response = await api.post("/ai-test/audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const {
        aiResponse,
        transcript,
        conversationId: newConversationId,
        currentOrder: newOrder,
      } = response.data;

      // Importante: aggiorna l'ID conversazione se è nuovo
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
      }

      // Aggiorna l'ordine corrente con i nuovi elementi
      if (newOrder) {
        console.log("Aggiornamento ordine:", newOrder);
        setCurrentOrder(newOrder);
      }

      // Aggiorna i messaggi con la trascrizione e la risposta AI
      setMessages((prev) => [
        ...prev,
        { role: "user", content: transcript },
        { role: "assistant", content: aiResponse },
      ]);
    } catch (err) {
      console.error("Errore nell'elaborazione dell'audio:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Si è verificato un errore nell'elaborazione dell'audio. Riprova.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Aggiungi questa funzione per estrarre il JSON dalla risposta AI
  const extractOrderDataFromResponse = (response: string) => {
    try {
      // Cerca un blocco JSON nella risposta
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      return null;
    } catch (e) {
      console.error("Errore nell'estrazione del JSON:", e);
      return null;
    }
  };

  // Aggiungi questa funzione per rilevare la conferma dell'ordine
  const isOrderConfirmed = (userMessage: string) => {
    const confirmPhrases = [
      "confermo",
      "va bene",
      "ok",
      "procedi",
      "perfetto",
      "confermiamo",
    ];
    return confirmPhrases.some((phrase) =>
      userMessage.toLowerCase().includes(phrase)
    );
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    // Se l'ordine è già stato confermato, non permettere di inviare altri messaggi
    if (orderConfirmed && confirmedOrder.length > 0) {
      alert(
        "L'ordine è già confermato. Per un nuovo ordine, clicca su 'Nuova Conversazione'."
      );
      setInputText("");
      return;
    }

    setIsLoading(true);
    const userMessage = inputText;
    const isConfirmation = isOrderConfirmed(userMessage);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputText("");

    try {
      console.log("Sending text message:", userMessage);
      console.log("Conversation ID:", conversationId);

      // Log della richiesta che stiamo per inviare
      console.log(
        "Sending request to:",
        api.defaults.baseURL + "/ai-test/process-text"
      );

      const response = await api.post("/ai-test/process-text", {
        text: userMessage,
        conversationId,
      });

      console.log("Text processing response:", response.data);

      const {
        aiResponse,
        conversationId: newConversationId,
        currentOrder: newOrder,
      } = response.data;

      if (!conversationId) {
        setConversationId(newConversationId);
      }

      // Estrai i dati dell'ordine dalla risposta AI
      const orderData = extractOrderDataFromResponse(aiResponse);
      if (orderData && orderData.orderItems) {
        setCurrentOrder(orderData.orderItems);
        setProposedOrder(orderData.orderItems);
      } else if (newOrder) {
        setCurrentOrder(newOrder);
        setProposedOrder(newOrder);
      }

      // Se è una conferma, aggiorna lo stato e il pannello degli slot
      if (isConfirmation && proposedOrder.length > 0) {
        setOrderConfirmed(true);
        setConfirmedOrder([...proposedOrder]);

        // Estrai lo slot scelto dal messaggio AI
        const slot = extractTimeSlot();
        console.log("Slot estratto:", slot);

        // Conta le pizze nell'ordine
        const pizzeOrdinate = proposedOrder.reduce(
          (sum, item) =>
            sum +
            (item.name.toLowerCase().includes("pizza") ||
            item.name.toLowerCase().includes("margherita") ||
            item.name.toLowerCase().includes("diavola") ||
            item.name.toLowerCase().includes("marinara") ||
            item.name.toLowerCase().includes("capricciosa")
              ? item.quantity
              : 0),
          0
        );

        // Aggiorna gli slot
        setSlots((prevSlots) =>
          prevSlots.map((slotItem) =>
            slotItem.time === slot
              ? {
                  ...slotItem,
                  available: Math.max(0, slotItem.available - pizzeOrdinate),
                }
              : slotItem
          )
        );
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (err: any) {
      console.error("Errore nell'elaborazione del testo:", err);
      // Log dettagliato dell'errore
      if (err.response) {
        console.error("Server response:", err.response.data);
        console.error("Status code:", err.response.status);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Si è verificato un errore nell'elaborazione del messaggio. Riprova.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = async () => {
    if (conversationId) {
      try {
        // Aggiornato da axios a api
        await api.delete(`/ai-test/conversation/${conversationId}`);
      } catch (err) {
        console.error("Errore nel reset della conversazione:", err);
      }
    }

    setConversationId(null);
    setCurrentOrder([]);
    setMessages([
      {
        role: "system",
        content: "Benvenuto alla Pizzeria Demo. Come posso aiutarti?",
      },
    ]);
  };

  // Aggiungi questo componente nella UI
  const MenuDisplay = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Menu della Pizzeria</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? "Nascondi Menu" : "Mostra Menu"}
          </Button>
        </CardTitle>
      </CardHeader>
      {showMenu && (
        <CardContent>
          <div className="space-y-4">
            {testMenu.map((categoryGroup) => (
              <div key={categoryGroup.category}>
                <h3 className="font-medium text-lg mb-2">
                  {categoryGroup.category}
                </h3>
                <div className="space-y-2 ml-2">
                  {categoryGroup.items.map((item) => (
                    <div key={item.name} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span>€{item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );

  // Sostituisci il componente SlotAvailabilityDisplay con questo

  const SlotAvailabilityDisplay = () => {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Disponibilità Orari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.time}
                className="flex items-center justify-between mb-2"
              >
                <div className="font-medium w-24">{slot.time}</div>
                <div className="flex-1 mx-2">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden border">
                    <div
                      className={`h-full ${
                        slot.available <= 2
                          ? "bg-red-500"
                          : slot.available <= 5
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          100 - (slot.available / slot.capacity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm font-bold w-10 text-center">
                  {slot.available}/{slot.capacity}
                </div>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-sm font-medium mb-2">Legenda:</p>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs">Disponibile</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span className="text-xs">Quasi pieno</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs">Quasi esaurito</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Sostituisci il componente OrderStateManager esistente con questo

  const OrderStateManager = ({
    onUpdate,
  }: {
    order: any;
    onUpdate: (status: OrderStatus) => void;
  }) => {
    const [currentState, setCurrentState] = useState(OrderStatus.PENDING);

    // Mappa degli stati per visualizzazione e azioni
    const stateInfo = {
      [OrderStatus.PENDING]: {
        label: "In attesa",
        color: "bg-amber-100 text-amber-800",
        icon: "⏱️",
        nextAction: "Conferma",
        nextState: OrderStatus.CONFIRMED,
      },
      [OrderStatus.CONFIRMED]: {
        label: "Confermato",
        color: "bg-blue-100 text-blue-800",
        icon: "✅",
        nextAction: "Inizia preparazione",
        nextState: OrderStatus.PREPARING,
      },
      [OrderStatus.PREPARING]: {
        label: "In preparazione",
        color: "bg-indigo-100 text-indigo-800",
        icon: "👨‍🍳",
        nextAction: "Segna pronto",
        nextState: OrderStatus.READY,
      },
      [OrderStatus.READY]: {
        label: "Pronto",
        color: "bg-green-100 text-green-800",
        icon: "🍕",
        nextAction: "Segna completato",
        nextState: OrderStatus.COMPLETED,
      },
      [OrderStatus.COMPLETED]: {
        label: "Completato",
        color: "bg-gray-100 text-gray-800",
        icon: "🎉",
        nextAction: "",
        nextState: null,
      },
      [OrderStatus.CANCELLED]: {
        label: "Cancellato",
        color: "bg-red-100 text-red-800",
        icon: "❌",
        nextAction: "",
        nextState: null,
      },
    };

    const current = stateInfo[currentState];

    const updateState = (newState: OrderStatus) => {
      setCurrentState(newState);
      onUpdate(newState);
    };

    return (
      <div className="mt-4">
        <h3 className="font-medium mb-2">Stato Ordine:</h3>

        {/* Visualizza lo stato corrente */}
        <div
          className={`p-3 rounded-md mb-3 flex items-center ${current.color}`}
        >
          <span className="mr-2 text-lg">{current.icon}</span>
          <span className="font-medium">{current.label}</span>
        </div>

        <div className="flex space-x-2">
          {/* Bottone per l'azione successiva (se disponibile) */}
          {current.nextState && (
            <Button
              onClick={() => updateState(current.nextState!)}
              className="flex-grow"
            >
              {current.nextAction}
            </Button>
          )}

          {/* Bottone per cancellare (disponibile sempre tranne negli stati finali) */}
          {currentState !== OrderStatus.COMPLETED &&
            currentState !== OrderStatus.CANCELLED && (
              <Button
                variant="destructive"
                onClick={() => updateState(OrderStatus.CANCELLED)}
              >
                Cancella ordine
              </Button>
            )}
        </div>
      </div>
    );
  };

  // // Modifica la funzione che riceve la risposta AI
  // const handleAIResponse = (response: any) => {
  //   // Estrai la risposta AI e i dettagli dell'ordine
  //   const { aiResponse, currentOrder: newOrder, orderConfirmation } = response;

  //   // Aggiorna l'ordine proposto
  //   if (newOrder) {
  //     setProposedOrder(newOrder);
  //   }

  //   // Se l'AI indica che l'ordine è stato confermato, aggiorna l'ordine confermato
  //   if (orderConfirmation === true) {
  //     setOrderConfirmed(true);
  //     setConfirmedOrder(proposedOrder);
  //   }

  //   // Aggiorna i messaggi con la risposta AI
  //   setMessages((prev) => [
  //     ...prev,
  //     { role: "assistant", content: aiResponse },
  //   ]);
  // };

  // Aggiungi questa funzione per estrarre il nome cliente

  const extractCustomerName = () => {
    // Cerca negli ultimi messaggi dell'assistente una menzione del nome
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "user") {
        const nameMatch = msg.content.match(
          /(?:sono|mi chiamo|nome[:]?\s*)\s*(\w+)/i
        );
        if (nameMatch) return nameMatch[1];
      } else if (msg.role === "assistant" && msg.content.includes("Claudio")) {
        return "Claudio"; // Default per la demo
      }
    }
    return "Cliente"; // Default
  };

  // Sostituisci la funzione extractTimeSlot con questa implementazione completa

  const extractTimeSlot = (): string => {
    // Cerca negli ultimi messaggi dell'assistente
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === "assistant") {
        // Cerca pattern come "19:00-19:15" o "Orario di ritiro: 19:00-19:15"
        const slotMatch = msg.content.match(
          /(\d{1,2}[:\.]\d{2})-(\d{1,2}[:\.]\d{2})/
        );
        if (slotMatch) {
          return slotMatch[0]; // Restituisce il formato "19:00-19:15"
        }

        // Cerca pattern "Orario: 19:00"
        const timeMatch = msg.content.match(
          /[Oo]rario(?:\ di ritiro)?:?\s*(\d{1,2}[:\.]\d{2})/
        );
        if (timeMatch) {
          const time = timeMatch[1];
          // Determina lo slot basato sull'ora
          const hour = parseInt(time.split(/[:\.]/)[0]);
          const minutes = parseInt(time.split(/[:\.]/)[1]);
          const slotMinutes = Math.floor(minutes / 15) * 15;
          const slotEnd =
            slotMinutes === 45
              ? `${hour + 1}:00`
              : `${hour}:${(slotMinutes + 15).toString().padStart(2, "0")}`;
          return `${hour}:${slotMinutes
            .toString()
            .padStart(2, "0")}-${slotEnd}`;
        }
      }
    }

    // Se non troviamo un orario nei messaggi, restituisci un valore predefinito
    return "Orario non specificato";
  };

  // Modifica il componente Dettagli Ordine per mostrare i dettagli completi
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Demo Assistente AI</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Conversazione</span>
                <Button variant="outline" size="sm" onClick={resetConversation}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Nuova Conversazione
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden flex flex-col">
              {/* Modifiche qui per migliorare lo scroll */}
              <ScrollArea className="flex-grow pr-4 h-[370px]">
                {" "}
                {/* Altezza specifica per garantire lo scroll */}
                <div className="space-y-4 pb-2">
                  {messages
                    .filter((msg, idx) => {
                      // Nasconde i messaggi di sistema, tranne il primo messaggio di benvenuto
                      if (msg.role === "system") {
                        // Se è il primo messaggio e contiene il benvenuto, lo mostra come messaggio dell'assistente
                        return (
                          idx === 0 &&
                          msg.content ===
                            "Benvenuto alla Pizzeria Demo. Come posso aiutarti?"
                        );
                      }
                      return true; // Mostra tutti gli altri messaggi (user e assistant)
                    })
                    .map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary/10 ml-8"
                            : msg.role === "system"
                            ? "bg-secondary/10 mr-8" // Mostra il messaggio di benvenuto come fosse dell'assistente
                            : "bg-secondary/10 mr-8"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    ))}
                  {isLoading && (
                    <div className="p-3 rounded-lg bg-secondary/10 mr-8">
                      <p>Elaborazione...</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="mt-4 flex gap-2">
                <div className="flex-grow relative">
                  <Textarea
                    placeholder={
                      orderConfirmed
                        ? "Ordine confermato. Clicca 'Nuova Conversazione' per un nuovo ordine."
                        : "Scrivi il tuo messaggio qui..."
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        inputText.trim() &&
                        !orderConfirmed
                      ) {
                        e.preventDefault();
                        handleSendText();
                      }
                    }}
                    className="w-full min-h-[120px] max-h-[300px] overflow-auto"
                    rows={5}
                    disabled={orderConfirmed && confirmedOrder.length > 0}
                    style={{
                      resize: "vertical",
                      lineHeight: "1.5",
                      padding: "12px 16px",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(0,0,0,0.2) transparent",
                    }}
                  />
                  {/* Aggiungi un indicatore di focus per migliorare l'accessibilità */}
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {inputText.length > 0
                      ? `${inputText.length} caratteri`
                      : ""}
                  </div>
                </div>

                {/* Sostituzione completa dei pulsanti */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    disabled={
                      isLoading ||
                      !browserSupportsSTT ||
                      (orderConfirmed && confirmedOrder.length > 0)
                    }
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    onClick={handleSendText}
                    disabled={
                      isLoading ||
                      !inputText.trim() ||
                      (orderConfirmed && confirmedOrder.length > 0)
                    }
                    size="icon"
                    title="Invia messaggio"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!browserSupportsSTT && (
                <div className="mt-2 bg-amber-50 text-amber-800 text-xs p-2 rounded border border-amber-200 flex items-center">
                  <span className="mr-1">ℹ️</span>
                  Per utilizzare il microfono, apri questa pagina in Chrome o
                  Brave
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <MenuDisplay />
          <SlotAvailabilityDisplay />
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Ordine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Ristorante di Test:</h3>
                  <p>Pizzeria Demo</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Stato:</h3>
                  <p>
                    {orderConfirmed
                      ? "Ordine confermato"
                      : isLoading
                      ? "Elaborazione..."
                      : conversationId
                      ? "Conversazione attiva"
                      : "In attesa"}
                  </p>
                </div>

                {orderConfirmed && confirmedOrder.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Cliente:</h3>
                    <p>{extractCustomerName()}</p>

                    <h3 className="font-medium mt-2 mb-2">Ritiro:</h3>
                    <p>{extractTimeSlot()}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">Elementi dell'ordine:</h3>
                  {orderConfirmed && confirmedOrder.length > 0 ? (
                    <div>
                      <div className="bg-green-100 text-green-800 p-2 mb-3 rounded-md text-sm">
                        ✅ Ordine confermato dal cliente
                      </div>
                      <ul className="list-disc list-inside">
                        {confirmedOrder.map((item, idx) => (
                          <li key={idx}>
                            {item.name} - {item.quantity} x €
                            {item.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : proposedOrder.length > 0 ? (
                    <div>
                      <div className="bg-amber-100 text-amber-800 p-2 mb-3 rounded-md text-sm">
                        ⏳ In attesa di conferma dal cliente
                      </div>
                      <ul className="list-disc list-inside text-gray-500">
                        {proposedOrder.map((item, idx) => (
                          <li key={idx}>
                            {item.name} - {item.quantity} x €
                            {item.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>Nessun elemento nell'ordine.</p>
                  )}
                </div>

                {/* Mostra OrderStateManager solo se c'è un ordine CONFERMATO */}
                {orderConfirmed && confirmedOrder.length > 0 ? (
                  <OrderStateManager
                    order={confirmedOrder}
                    onUpdate={(status) =>
                      console.log("Order status updated to:", status)
                    }
                  />
                ) : (
                  <div className="mt-4 p-3 bg-gray-100 rounded-md text-gray-500 text-sm">
                    {proposedOrder.length > 0
                      ? "In attesa della conferma del cliente"
                      : "Effettua un ordine per gestire lo stato"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
