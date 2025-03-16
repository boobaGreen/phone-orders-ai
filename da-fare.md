# Roadmap Progetto Pizzeria SaaS --

## Panoramica

Questo documento elenca le funzionalità da implementare e i bug da risolvere nelle prossime iterazioni del progetto Pizzeria SaaS.

## Gestione Ristoranti

### Pagina Dettaglio Ristorante (`/businesses/:id`)

#### Funzionalità Critiche

- [ ] **Eliminazione Ristorante**

  - Implementare funzionalità di eliminazione con doppia conferma
  - Verificare che il ristorante non abbia ordini attivi prima di permettere l'eliminazione
  - Mostrare errori appropriati se non è possibile eliminare
  - Utilizzare Dialog di shadcn per la conferma

- [ ] **Gestione Stato di Attività**

  - Aggiungere toggle per attivare/disattivare un ristorante (usare Switch di shadcn)
  - Implementare la logica di back-end per aggiornare lo stato `isActive`

- [ ] **Modifica Informazioni**
  - Correggere link "Modifica Informazioni" (attualmente porta a 404)
  - Creare componente per la modifica o utilizzare una modale in linea con il design system esistente
  - Utilizzare Form di shadcn con validazione

#### Funzionalità Aggiuntive

- [ ] **Gestione Orari**

  - Implementare modifica degli orari di apertura
  - Opzione 1: Rendere la tabella direttamente modificabile con modalità edit
  - Opzione 2: Creare modale dedicata per la modifica degli orari
  - Utilizzare TimePicker di shadcn quando disponibile

- [ ] **Menu Management**

  - Sviluppare pagina "Gestisci Menu" (`/businesses/:id/menu`)
  - Implementare CRUD per categorie di prodotti
  - Implementare CRUD per singoli prodotti
  - Gestire prezzi e varianti
  - Utilizzare Card, Accordion e Sheet di shadcn

- [ ] **Ordini**
  - Sviluppare pagina "Visualizza Ordini" (`/businesses/:id/orders`)
  - Implementare filtri (per data, stato, ecc.) con componenti Select e DatePicker di shadcn
  - Visualizzare metriche e statistiche
  - Gestire funzionalità di accettazione/rifiuto ordini
  - Implementare DataTable con filtri e ordinamento

## Gestione Utente

### Pagina Profilo (`/profile`)

- [ ] **Implementare Pagina Profilo**

  - Correggere il link "Profilo" nel menu utente (attualmente porta a 404)
  - Visualizzare informazioni dell'utente (nome, email, data registrazione, ecc.)
  - Permettere la modifica dei dati personali
  - Implementare caricamento e gestione avatar utente
  - Utilizzare Avatar e Card di shadcn

- [ ] **Gestione Abbonamenti**

  - Visualizzare piano attuale
  - Mostrare stato del pagamento e data di rinnovo
  - Permettere upgrade/downgrade del piano
  - Storico pagamenti

- [ ] **Metodi di Pagamento**
  - Gestione carte di credito e metodi di pagamento
  - Aggiungere/rimuovere metodi di pagamento
  - Impostare metodo predefinito
  - Integrazione con gateway di pagamento (Stripe/PayPal)

### Pagina Impostazioni (`/settings`)

- [ ] **Implementare Pagina Impostazioni**

  - Correggere il link "Impostazioni" nel menu utente (attualmente porta a 404)
  - Valutare se mantenere questa pagina separata o integrarla con il profilo

- [ ] **Preferenze Interfaccia**

  - Impostazioni tema (chiaro/scuro/sistema)
  - Preferenze di lingua
  - Personalizzazione dashboard
  - Utilizzare RadioGroup e Select di shadcn

- [ ] **Sicurezza e Privacy**

  - Gestione password (modifica password)
  - Configurazione autenticazione a due fattori
  - Gestione sessioni attive
  - Preferenze privacy e condivisione dati

- [ ] **Notifiche**
  - Preferenze email (ordini, promozioni, aggiornamenti)
  - Notifiche browser
  - Notifiche push (se implementato)
  - Utilizzare Switch e Checkbox di shadcn

## UI/UX Generale

### Tema Scuro

- [ ] **Implementare Modalità Dark**
  - Aggiungere variabili CSS per tema scuro in `index.css`
  - Implementare toggle per cambiare tema (usare ModeToggle di shadcn)
  - Salvare preferenza utente in localStorage
  - Rispettare preferenze di sistema (prefers-color-scheme)
  - Configurare correttamente il tema in shadcn

### Miglioramenti UX

- [ ] **Feedback Utente**

  - Aggiungere toast per conferme di operazioni (Sonner o Toast di shadcn)
  - Migliorare messaggi di errore
  - Implementare skeleton loader durante il caricamento dei dati (Skeleton di shadcn)

- [ ] **Responsive Design**
  - Verificare e migliorare esperienza su dispositivi mobili
  - Testare su varie dimensioni di schermo
  - Utilizzare Sheet di shadcn per menu mobili

## Testing e Quality Assurance

- [ ] **Test Unitari**

  - Implementare test per i componenti principali
  - Testare funzionalità di autenticazione

- [ ] **Test End-to-End**
  - Implementare test E2E per flussi critici (creazione ristorante, ordini)

## Infrastruttura

- [ ] **Ottimizzazione Performance**

  - Implementare lazy loading per componenti pesanti
  - Ottimizzare bundle size

- [ ] **Logging e Monitoring**
  - Migliorare sistema di logging
  - Implementare tracking errori frontend

---

## Priorità e Pianificazione

1. Correggere pagine 404 esistenti (link "Modifica", "Gestisci Menu", "Visualizza Ordini")
2. Implementare toggle per attivare/disattivare ristoranti
3. Sviluppare funzionalità di gestione menu
4. Implementare gestione ordini
5. Aggiungere funzionalità di modifica orari
6. Implementare modalità dark
7. Funzionalità di eliminazione ristorante
8. Miglioramenti UX e test

## Note Tecniche

- **Utilizzare shadcn/ui come prima scelta** per tutti i componenti dell'interfaccia
- Per nuovi componenti necessari, preferire l'installazione e la personalizzazione di quelli shadcn
- Mantenere la convenzione del progetto per variabili CSS e integrarle con il tema shadcn
- Riutilizzare componenti dove possibile
- Seguire pattern di gestione stato già stabiliti
- Per funzionalità non coperte da shadcn, sviluppare componenti coerenti con il design system
