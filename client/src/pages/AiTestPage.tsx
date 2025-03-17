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
import axios from "axios";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

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
      content: "Benvenuto alla Pizzeria Test. Come posso aiutarti?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isVoskReady, setIsVoskReady] = useState(false);
  const [, setLoadingMessage] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup media resources on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Check Vosk status
  useEffect(() => {
    const checkVoskStatus = async () => {
      try {
        const response = await axios.get("/api/ai-test/vosk-status");
        const { ready, downloadProgress } = response.data;

        setIsVoskReady(ready);
        if (!ready && downloadProgress < 100) {
          setLoadingMessage(
            `Preparazione modello vocale: ${downloadProgress}%`
          );
        } else if (!ready) {
          setLoadingMessage("Inizializzazione modello vocale...");
        } else {
          setLoadingMessage("");
        }
      } catch (error) {
        console.error("Errore nel controllo dello stato di Vosk:", error);
      }
    };

    checkVoskStatus();
    const interval = setInterval(checkVoskStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Funzione per avviare/fermare la registrazione
  const toggleRecording = async () => {
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
      const response = await axios.post("/api/ai-test/process-text", {
        text: transcript,
        conversationId,
      });

      const {
        aiResponse,
        conversationId: newConversationId,
        currentOrder: newOrder,
      } = response.data;

      if (!conversationId) {
        setConversationId(newConversationId);
      }

      setCurrentOrder(newOrder || []);
      setMessages((prev) => [
        ...prev,
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

      // MODIFICA QUI: Usa l'URL completo del backend
      const response = await axios.post(
        "http://localhost:3005/api/ai-test/audio",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const {
        aiResponse,
        transcript,
        conversationId: newConversationId,
        currentOrder: newOrder,
      } = response.data;

      if (!conversationId) {
        setConversationId(newConversationId);
      }

      setCurrentOrder(newOrder || []);
      setMessages((prev) => [
        ...prev,
        // Mostra ciò che è stato trascritto
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

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    const userMessage = inputText;

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputText("");

    try {
      const response = await axios.post("/api/ai-test/process-text", {
        text: userMessage,
        conversationId,
      });

      const {
        aiResponse,
        conversationId: newConversationId,
        currentOrder: newOrder,
      } = response.data;

      if (!conversationId) {
        setConversationId(newConversationId);
      }

      setCurrentOrder(newOrder || []);
      setMessages((prev) => [
        ...prev,
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

  const resetConversation = async () => {
    if (conversationId) {
      try {
        await axios.delete(`/api/ai-test/conversation/${conversationId}`);
      } catch (err) {
        console.error("Errore nel reset della conversazione:", err);
      }
    }

    setConversationId(null);
    setCurrentOrder([]);
    setMessages([
      {
        role: "system",
        content: "Benvenuto alla Pizzeria Test. Come posso aiutarti?",
      },
    ]);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Test Assistente AI</h1>

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
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary/10 ml-8"
                          : msg.role === "system"
                          ? "bg-muted"
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
                    placeholder="Scrivi il tuo messaggio qui..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        inputText.trim()
                      ) {
                        e.preventDefault();
                        handleSendText();
                      }
                    }}
                    className="w-full min-h-[120px] max-h-[300px] overflow-auto"
                    rows={5}
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

                <div className="flex flex-col gap-2">
                  {!isVoskReady && (
                    <div className="text-amber-500 mb-2 text-xs bg-amber-50 p-2 rounded-md border border-amber-200 flex items-center">
                      <span className="animate-spin mr-2">⚙️</span>
                      Preparazione modello vocale in corso...
                      <span className="animate-pulse ml-1">...</span>
                    </div>
                  )}
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    disabled={isLoading || !isVoskReady}
                    title={
                      isRecording ? "Ferma registrazione" : "Registra audio"
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
                    disabled={isLoading || !inputText.trim()}
                    size="icon"
                    title="Invia messaggio"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Ordine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Ristorante di Test:</h3>
                  <p>Pizzeria Test</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Stato:</h3>
                  <p>
                    {isLoading
                      ? "Elaborazione..."
                      : conversationId
                      ? "Conversazione attiva"
                      : "In attesa"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Elementi dell'ordine:</h3>
                  {currentOrder.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {currentOrder.map((item, idx) => (
                        <li key={idx}>
                          {item.name} - {item.quantity} x €
                          {item.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nessun elemento nell'ordine.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
