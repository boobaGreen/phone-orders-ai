# Pizzeria SaaS - Sistema di Ordini Telefonici con AI

## Panoramica

Pizzeria SaaS è una piattaforma che permette alle pizzerie di gestire ordini telefonici tramite un assistente AI. Il sistema utilizza Twilio per gestire le chiamate telefoniche e un modello AI DeepSeek per conversare con i clienti, prendendo ordini in modo naturale.

## Funzionalità Principali

- 🍕 Gestione di menu personalizzabili per le pizzerie
- 📞 Assistente telefonico AI per ricevere ordini
- 📆 Sistema di prenotazione con fasce orarie
- 📊 Dashboard per monitorare ordini e attività
- 👤 Gestione multi-tenant con diversi piani di abbonamento
- 🌙 Tema chiaro/scuro

## Tecnologie Utilizzate

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Zustand, React Query
- **Backend**: Node.js, Express, TypeScript, MongoDB, Redis
- **AI**: DeepSeek API per l'elaborazione del linguaggio naturale
- **Telefonia**: Twilio per la gestione delle chiamate
- **Autenticazione**: Supabase Auth con integrazione JWT

## Struttura del Progetto

```
pizzeria-saas
├── client
│   ├── package.json         # Frontend dependencies
│   ├── tsconfig.json
│   └── src
│       └── App.tsx
├── server
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json
│   └── src
│       └── app.ts
├── shared                   # Shared types/utilities
│   └── types
│       └── index.ts
└── README.md
```

## Getting Started

1. Clone the repository.
2. Install dependencies for both server and client:
   - Navigate to the `server` directory and run `npm install`.
   - Navigate to the `client` directory and run `npm install`.
3. Set up environment variables for database connection and API keys.
4. Start the server and client applications.

## Future Enhancements

- Mobile app development for iOS and Android.
- Additional features for managing subscriptions and pricing tiers.
- Enhanced AI capabilities for better user interaction.

## License

This project is licensed under the MIT License.
