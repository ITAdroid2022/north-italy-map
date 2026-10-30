# Mappa Dinamica del Nord Italia con Salvataggio SQL e Autenticazione

Progetto completo per la visualizzazione e la gestione interattiva di mappe del Nord Italia, con supporto per autenticazione utenti (Login/Registrazione con password cifrate), sessione JWT e salvataggio automatico dello stato della mappa (province, comuni colorati e note) su database SQLite (sostituibile con MySQL/PostgreSQL).

## Struttura del Progetto

```
.
├── server.js               # Server Node.js Express con API e gestione SQLite
├── package.json            # Dipendenze Node.js
├── README.md               # Guida all'installazione ed esecuzione
├── db/
│   └── setup_database.sql  # Schema SQL di riferimento
└── public/
    ├── index.html          # Pagina di Login e Registrazione
    ├── map.html            # Mappa dinamica con Leaflet e salvataggio automatico
    ├── css/
    │   └── login.css       # Stili della pagina di Login
    └── js/
        └── auth.js         # Gestione chiamate API autenticazione
```

## Requisiti

- **Node.js**: Versione 16 o superiore

## Istruzioni per l'Avvio

1. Estrai il contenuto del file ZIP.
2. Apri il terminale nella cartella del progetto.
3. Installa le dipendenze con:
   ```bash
   npm install
   ```
4. Avvia il server:
   ```bash
   npm start
   ```
5. Apri il browser e vai su:
   ```text
   http://localhost:3000
   ```

## Funzionalità
- **Registrazione/Login**: Gli utenti possono registrarsi. Le password vengono salvate cifrate tramite `bcrypt`.
- **Caricamento Automatico**: Una volta eseguito l'accesso, le personalizzazioni della mappa (province selezionate, comuni colorati e note posizionate) vengono recuperate direttamente dal DB per quell'utente.
- **Salvataggio Automatico**: Ogni azione sulla mappa aggiorna automaticamente la configurazione dell'utente nel DB SQL.
- **Esportazione e Importazione Manuale**: Supportata anche la funzione di Export/Import tramite file JSON locale.
