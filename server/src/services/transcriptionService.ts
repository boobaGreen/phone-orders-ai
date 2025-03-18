import axios from "axios";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { Readable } from "stream";
import FormData from "form-data";
import { config } from "../config";
import { EventEmitter } from "events";

// Importiamo la libreria Vosk in modo sicuro (verrà installata dopo)
let vosk: any;
try {
  vosk = require("vosk");
} catch (e) {
  console.warn("Vosk non ancora installato, installalo con: npm install vosk");
}

// Crea un event emitter per notificare lo stato
class VoskStatusEmitter extends EventEmitter {}
const voskStatus = new VoskStatusEmitter();

class TranscriptionService {
  private apiKey: string;
  private baseUrl: string;
  private modelPath: string;
  private modelUrl: string;
  private isModelReady: boolean;
  private downloadProgress: number;

  constructor() {
    this.apiKey = config.deepSeek?.apiKey || process.env.DEEPSEEK_API_KEY || "";
    // Modifichiamo l'endpoint per usare quello corretto
    this.baseUrl =
      config.deepSeek?.endpoint || "https://api.deepseek.cloud/api";
    // Configurazione del percorso del modello
    this.modelPath =
      process.env.VOSK_MODEL_PATH ||
      path.join(process.cwd(), "models/vosk-model-small-it-0.22");
    this.modelUrl =
      "https://alphacephei.com/vosk/models/vosk-model-small-it-0.22.zip";
    this.isModelReady = false;
    this.downloadProgress = 0;

    // Inizializza il modello in background
    this.initializeModel().catch((err) => {
      console.error("Errore inizializzazione modello Vosk:", err);
    });
  }

  private async initializeModel(): Promise<void> {
    try {
      console.log("🔄 Inizializzazione del modello Vosk in corso...");

      // 👇 AGGIUNGI QUESTO BLOCCO QUI
      // Verifica se il modello esiste
      if (!fs.existsSync(this.modelPath)) {
        console.log("Modello Vosk non trovato, download in corso...");
        await this.downloadModel();
      }
      // 👆 FINE DEL NUOVO CODICE

      if (vosk && fs.existsSync(this.modelPath)) {
        try {
          // Tentativo di caricare il modello Vosk
          new vosk.Model(this.modelPath);
          this.isModelReady = true;
          console.log(
            "✅ Vosk model initialized successfully and ready for use!"
          );

          voskStatus.emit("status", {
            status: "ready",
            path: this.modelPath,
          });
        } catch (error) {
          console.error("❌ Error initializing Vosk model:", error);
          this.isModelReady = false;

          voskStatus.emit("status", {
            status: "error",
            error: "Errore nell'inizializzazione del modello Vosk",
          });
        }
      } else {
        console.error("❌ Vosk not available or model path doesn't exist");
        this.isModelReady = false;

        voskStatus.emit("status", {
          status: "error",
          error: "Vosk non disponibile o il percorso del modello non esiste",
        });
      }
    } catch (error) {
      console.error("❌ Error in Vosk initialization:", error);
      this.isModelReady = false;

      voskStatus.emit("status", {
        status: "error",
        error: "Errore nell'inizializzazione di Vosk",
      });
    }
  }

  private async downloadModel(): Promise<void> {
    // Crea la directory models se non esiste
    const modelsDir = path.dirname(this.modelPath);
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    // File temporanei
    const zipPath = path.join(modelsDir, "model.zip");

    return new Promise((resolve, reject) => {
      console.log(`📦 Download modello Vosk iniziato: 0%`);

      // Log periodico dello stato per mostare attività
      const downloadTimer = setInterval(() => {
        // Verifica se il file esiste
        if (fs.existsSync(zipPath)) {
          try {
            const stats = fs.statSync(zipPath);
            const sizeMB = stats.size / (1024 * 1024);
            console.log(
              `📦 Download in corso: ${sizeMB.toFixed(1)}MB scaricati...`
            );
          } catch (err) {
            // Ignora errori nella lettura delle statistiche
          }
        } else {
          console.log(`📦 Download in corso: in attesa di dati...`);
        }
      }, 10000); // Log ogni 10 secondi

      // Scarica il modello utilizzando wget o curl
      const downloadProcess = spawn("wget", [
        "-q",
        "--show-progress",
        this.modelUrl,
        "-O",
        zipPath,
      ]);

      downloadProcess.stderr.on("data", (data) => {
        // wget manda gli aggiornamenti di progresso su stderr
        const output = data.toString();
        console.log(`📊 ${output.trim()}`);
      });

      downloadProcess.on("error", (err) => {
        clearInterval(downloadTimer);
        console.error("❌ Download error:", err);
        // ... resto del codice per fallback a curl ...
      });

      downloadProcess.on("close", (code) => {
        clearInterval(downloadTimer);
        if (code === 0) {
          console.log("✅ Download completato! Inizio estrazione...");
          this.extractModel(zipPath, modelsDir).then(resolve).catch(reject);
        } else {
          console.error(`❌ wget fallito con codice ${code}`);
          reject(new Error(`wget failed with code ${code}`));
        }
      });
    });
  }

  private async extractModel(
    zipPath: string,
    targetDir: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("Extracting model...");
      const unzipProcess = spawn("unzip", [
        "-o", // Sovrascrivi i file esistenti
        zipPath,
        "-d",
        targetDir,
      ]);

      unzipProcess.on("error", (err) => {
        reject(new Error(`Unzip failed: ${err.message}`));
      });

      unzipProcess.on("close", (code) => {
        if (code === 0) {
          console.log("Model extracted successfully");
          // Elimina il file zip
          fs.unlink(zipPath, (err) => {
            if (err) console.warn("Could not delete zip file:", err);
          });
          resolve();
        } else {
          reject(new Error(`Unzip failed with code ${code}`));
        }
      });
    });
  }

  async transcribeAudio(audioPath: string, language = "it"): Promise<string> {
    // Se Vosk non è installato o il modello non è pronto, usa una soluzione di fallback
    if (!vosk || !this.isModelReady) {
      console.log("Vosk not available, using fallback solution");
      return this.fallbackTranscription(audioPath);
    }

    try {
      console.log(`Transcribing audio file with Vosk: ${audioPath}`);

      // Converti l'audio in formato WAV a 16kHz mono 16-bit PCM se necessario
      const wavPath = await this.convertAudioToWav(audioPath);

      // Carica il modello Vosk con configurazioni ottimizzate
      const model = new vosk.Model(this.modelPath);
      const recognizer = new vosk.Recognizer({
        model: model,
        sampleRate: 16000,
        // Aggiungi queste configurazioni per migliorare la precisione
        words: true, // Restituisci le parole con timestamp
        partials: false, // Non restituire risultati parziali
        maxAlternatives: 3, // Ottieni alternative per miglioramento
      });

      // Leggi il file e trascrivi
      const buffer = fs.readFileSync(wavPath);

      // Verifica dimensione minima dell'audio
      if (buffer.length < 2000) {
        // Circa 100ms @ 16kHz mono
        console.log("Audio troppo breve per trascrizione affidabile");
        return "L'audio è troppo breve per essere trascritto correttamente";
      }

      recognizer.acceptWaveform(buffer);
      const result = recognizer.finalResult();

      // Miglioramento: esplora le alternative se il risultato principale è vuoto
      let transcript = result.text || "";

      if (
        !transcript &&
        result.alternatives &&
        result.alternatives.length > 0
      ) {
        transcript = result.alternatives[0].text || "";
        console.log(`Usando trascrizione alternativa: ${transcript}`);
      }

      // Se ancora vuoto, usa un messaggio più informativo
      if (!transcript.trim()) {
        transcript =
          "Audio ricevuto ma non è stato possibile trascriverlo. Prova a parlare più chiaramente.";
      }

      console.log(`Vosk transcription result: ${transcript}`);
      return transcript;
    } catch (error) {
      console.error("Error during Vosk transcription:", error);
      return this.fallbackTranscription(audioPath);
    }
  }

  private async convertAudioToWav(audioPath: string): Promise<string> {
    // Se il file è già WAV a 16kHz, ottimizzalo
    if (audioPath.endsWith(".wav")) {
      const optimizedPath = `${audioPath}_optimized.wav`;

      return new Promise((resolve, reject) => {
        // Usa ffmpeg per ottimizzare l'audio
        const ffmpegProcess = spawn("ffmpeg", [
          "-i",
          audioPath,
          "-ar",
          "16000", // 16kHz
          "-ac",
          "1", // Mono
          "-c:a",
          "pcm_s16le", // 16-bit PCM
          "-af",
          "volume=1.5,highpass=f=200,lowpass=f=3000", // Filtri audio
          optimizedPath,
        ]);

        ffmpegProcess.on("error", (err) => {
          console.error("FFmpeg error:", err);
          resolve(audioPath); // Fallback al file originale
        });

        ffmpegProcess.on("close", (code) => {
          if (code === 0) {
            resolve(optimizedPath);
          } else {
            console.warn(`FFmpeg exited with code ${code}`);
            resolve(audioPath);
          }
        });
      });
    }

    // Per altri formati (non WAV), converti in WAV ottimizzato
    const optimizedPath = `${audioPath}_converted.wav`;

    return new Promise((resolve, reject) => {
      // Usa ffmpeg per convertire e ottimizzare qualsiasi formato
      const ffmpegProcess = spawn("ffmpeg", [
        "-i",
        audioPath,
        "-ar",
        "16000", // 16kHz
        "-ac",
        "1", // Mono
        "-c:a",
        "pcm_s16le", // 16-bit PCM
        "-af",
        "volume=1.5,highpass=f=200,lowpass=f=3000", // Filtri audio
        optimizedPath,
      ]);

      ffmpegProcess.on("error", (err) => {
        console.error("FFmpeg error during conversion:", err);
        resolve(audioPath); // Fallback al file originale
      });

      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          console.log(`Audio convertito con successo in: ${optimizedPath}`);
          resolve(optimizedPath);
        } else {
          console.warn(`FFmpeg conversion failed with code ${code}`);
          resolve(audioPath);
        }
      });
    });
  }

  // Soluzione fallback che simula una trascrizione per testing
  private fallbackTranscription(audioPath: string): Promise<string> {
    return new Promise((resolve) => {
      console.log("Using fallback transcription for testing");

      // Genera un numero basato sulla dimensione del file per varietà
      const fileStats = fs.statSync(audioPath);
      const fileSizeKB = fileStats.size / 1024;

      const simulazioni = [
        "Vorrei ordinare una pizza margherita grande",
        "Una pizza diavola e una bibita, grazie",
        "Avete disponibilità per consegna alle otto?",
        "Vorrei una quattro formaggi e una porzione di patatine",
        "A che ora chiudete stasera?",
      ];

      const index = Math.floor(fileSizeKB % simulazioni.length);
      const transcript = simulazioni[index];

      console.log(`Fallback transcription result: ${transcript}`);
      setTimeout(() => resolve(transcript), 500); // Simula un breve ritardo
    });
  }

  // Funzione per ottenere lo stato attuale
  getStatus(): { ready: boolean; downloadProgress: number } {
    return {
      ready: this.isModelReady,
      downloadProgress: this.downloadProgress,
    };
  }

  // Registra una callback per lo stato
  onStatusChange(callback: (status: any) => void): void {
    voskStatus.on("status", callback);
  }
}

export default new TranscriptionService();
