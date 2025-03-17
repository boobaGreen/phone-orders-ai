# 🍕 Phone Orders AI - AI Phone Order System

Phone Orders AI è una piattaforma all'avanguardia che consente alle pizzerie di automatizzare gli ordini telefonici attraverso un assistente AI. Il sistema utilizza Twilio per la gestione delle chiamate e modelli DeepSeek AI per conversazioni naturali con i clienti, creando un'esperienza di ordinazione fluida.

## Funzionalità Principali

- **Gestione Menu**: CRUD per categorie e prodotti, gestione prezzi e varianti
- **Gestione Ordini**: Visualizzazione ordini, filtri, metriche e statistiche
- **Gestione Utenti**: Profilo utente, abbonamenti, metodi di pagamento
- **Integrazione Twilio**: Gestione chiamate, numeri dedicati, identificazione business
- **Integrazione DeepSeek AI**: Comprensione ordini, gestione conversazioni, analisi semantica
- **Trascrizione Vocale**: Conversione automatica da voce a testo con VOSK (offline)
- **Tema Scuro**: Supporto per modalità chiaro/scuro

## Tecnologie Utilizzate

- **Frontend**: React, TypeScript, shadcn/ui
- **Backend**: Node.js, Express, MongoDB
- **AI**: DeepSeek AI per comprensione del testo e generazione risposte
- **Speech-to-Text**: Vosk (locale/offline) + Web Speech API (browser)
- **Telecomunicazioni**: Twilio
- **Pagamenti**: Stripe, PayPal
- **Autenticazione**: OAuth 2.0 con Google, Supabase

## Struttura del Progetto

Il progetto è diviso in due parti principali:

### Client (Frontend)

```
/client
├── public/              # Risorse statiche
├── src/
│   ├── components/      # Componenti React riutilizzabili
│   │   ├── ui/          # Componenti UI di base
│   │   ├── layout/      # Layout e struttura
│   │   └── landing/     # Componenti per landing page
│   ├── pages/           # Pagine dell'applicazione
│   │   ├── auth/        # Pagine di autenticazione
│   │   ├── dashboard/   # Dashboard e aree protette
│   │   └── businesses/  # Gestione ristoranti
│   ├── services/        # Servizi API e integrazioni
│   ├── store/           # Gestione dello stato (Zustand)
│   └── routes.tsx       # Configurazione delle rotte
```

### Server (Backend)

```
/server
├── src/
│   ├── config/          # Configurazioni
│   ├── controllers/     # Controller REST
│   ├── middleware/      # Middleware Express
│   ├── models/          # Modelli dati MongoDB
│   ├── routes/          # Definizione delle rotte API
│   ├── services/        # Servizi di business logic
│   └── app.ts           # Applicazione Express
```

## Installazione e Configurazione

1. Clona il repository:

   ```bash
   git clone https://github.com/tuo-username/phone-order-ai.git
   cd phone-order-ai
   ```

2. Installa le dipendenze per il frontend:

   ```bash
   cd client
   npm install
   ```

3. Installa le dipendenze per il backend:

   ```bash
   cd ../server
   npm install
   ```

4. Configura le variabili d'ambiente:

   - Crea un file `.env` nella cartella `/server` basandoti su `.env.example`
   - Crea un file `.env.local` nella cartella `/client` basandoti su `.env.local.example`

5. Avvia il backend in modalità sviluppo:

   ```bash
   cd server
   npm run dev
   ```

6. Avvia il frontend in modalità sviluppo:
   ```bash
   cd client
   npm run dev
   ```

## Variabili d'Ambiente

### Client

```
VITE_API_URL=http://localhost:3005
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLIC_KEY=your-supabase-public-key
```

### Server

```
PORT=3005
MONGODB_URI=mongodb://localhost:27017/phone-orders-ai
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_ENDPOINT=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
SUPABASE_URL=your-supabase-url
SUPABASE_PUBLIC_KEY=your-supabase-public-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
REDIS_URL=redis://localhost:6379
```

## Test AI Conversazionale

La piattaforma include una pagina di test AI accessibile pubblicamente per testare le capacità di comprensione e risposta dell'assistente AI:

1. Accedi a http://localhost:5173/ai-test
2. Prova l'interfaccia conversazionale con input testuale
3. Utilizza la funzionalità di registrazione vocale per testare il riconoscimento vocale

## Sviluppo e Contribuzione

1. Crea un fork del repository
2. Crea un branch per la tua feature: `git checkout -b feature/amazing-feature`
3. Effettua le modifiche e i commit: `git commit -m 'Aggiungi una nuova feature'`
4. Push al branch: `git push origin feature/amazing-feature`
5. Apri una Pull Request

## Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.
