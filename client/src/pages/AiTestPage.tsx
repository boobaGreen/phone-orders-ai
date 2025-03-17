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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    };
  }, []);

  // Funzione per avviare/fermare la registrazione
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        // Clean up any existing stream first
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

          // Stop tracks after processing to release the microphone
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Errore nell'accesso al microfono:", err);
        alert(
          "Impossibile accedere al microfono. Verifica le autorizzazioni del browser."
        );
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);

    try {
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });

      const formData = new FormData();
      formData.append("audio", audioFile);
      if (conversationId) {
        formData.append("conversationId", conversationId);
      }

      const response = await axios.post(
        "/api/ai-test/process-audio",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
        { role: "user", content: "Audio: <registrazione vocale>" },
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
  };

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
              <ScrollArea className="flex-grow pr-4">
                <div className="space-y-4">
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
                <Textarea
                  placeholder="Scrivi il tuo messaggio qui..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && inputText.trim()) {
                      e.preventDefault();
                      handleSendText();
                    }
                  }}
                  className="flex-grow"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    disabled={isLoading}
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
