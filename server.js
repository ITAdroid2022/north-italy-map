const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "chiave_segreta_super_sicura_mappe_2026";

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Inizializzazione Database SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Errore di connessione al database SQLite:", err.message);
    } else {
        console.log("Connesso al database SQLite.");
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_map_data (
        user_id INTEGER PRIMARY KEY,
        map_json TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
});

// Middleware Autenticazione JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Accesso non autorizzato" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Token non valido o scaduto" });
        req.user = user;
        next();
    });
}

// API Registrazione
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username e password obbligatori" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: "Username già registrato" });
                }
                return res.status(500).json({ error: "Errore nel salvataggio dell'utente" });
            }
            res.json({ success: true, message: "Registrazione completata!" });
        });
    } catch (err) {
        res.status(500).json({ error: "Errore di cifratura password" });
    }
});

// API Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Inserisci username e password" });
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: "Credenziali errate" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Credenziali errate" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ success: true, token, username: user.username });
    });
});

// API Get Mappa Utente
app.get('/api/map-data', authenticateToken, (req, res) => {
    db.get(`SELECT map_json FROM user_map_data WHERE user_id = ?`, [req.user.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Errore nel recupero dati" });
        }
        if (!row) {
            return res.json({ map_json: null });
        }
        res.json({ map_json: JSON.parse(row.map_json) });
    });
});

// API Save Mappa Utente
app.post('/api/map-data', authenticateToken, (req, res) => {
    const mapJsonStr = JSON.stringify(req.body.mapData);
    db.run(`INSERT INTO user_map_data (user_id, map_json) VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET map_json = excluded.map_json, updated_at = CURRENT_TIMESTAMP`,
            [req.user.id, mapJsonStr], (err) => {
        if (err) {
            return res.status(500).json({ error: "Errore durante il salvataggio" });
        }
        res.json({ success: true, message: "Mappa salvata con successo!" });
    });
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server avviato con successo su http://localhost:${PORT}`);
});
