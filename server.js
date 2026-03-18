const express = require('express');
const app = express();
const mysql = require('mysql2');
const ip = require('ip'); 
const dotenv = require('dotenv');
require('dotenv').config();

app.listen(4000, () => {
    let monIp = ip.address();
    console.log(`Server lecture sur http://${monIp}:4000`);
});

const connection = mysql.createConnection({
    host: '172.29.17.129',
    user: process.env.LoginBDD,
    password: process.env.PasswordBDD,
    database: 'ubercombat'
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la BDD :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL.');
});

app.use(express.static('Public'));
app.use(express.json());

// ─── SESSION ────────────────────────────────────────────────────────────────
app.use(session({
    secret: 'secret_très_long_à_mettre_dans_un_env',   // ← idéalement process.env.SESSION_SECRET
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,   // inaccessible au JS client
        secure: false,    // passer à true en HTTPS
        maxAge: 1000 * 60 * 60 * 24  // 24 h
    }
}));

// ─── MIDDLEWARE AUTH ─────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Non authentifié' });
    }
    next();
}

// ─── ROUTE : état de connexion (remplace localStorage côté client) ───────────
app.get('/me', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

// ─── ROUTE : INSCRIPTION ─────────────────────────────────────────────────────
app.post('/register', async (req, res) => {
    const { login, email, password, age } = req.body;

    try {
        // Hash du mot de passe (coût 12)
        const hashedPassword = await bcrypt.hash(password, 10);

        connection.query(
            'INSERT INTO utilisateur (pseudo, email, password, age) VALUES (?, ?, ?, ?)',
            [login, email, hashedPassword, age],
            (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Erreur serveur' });
                }
                res.json({ message: 'Inscription réussie !' });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors du hashage du mot de passe' });
    }
});

// ─── ROUTE : CONNEXION ───────────────────────────────────────────────────────
app.post('/connexion', (req, res) => {
    const { login, password } = req.body;

    connection.query(
        'SELECT * FROM utilisateur WHERE pseudo = ?',
        [login],
        async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Identifiants ou mot de passe incorrects' });
            }

            const user = results[0];

            // Comparaison du mot de passe avec le hash
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: 'Identifiants ou mot de passe incorrects' });
            }

            // Stocker l'id en session côté serveur (jamais envoyé au client)
            req.session.userId = user.id_user;

            res.json({ message: 'Connexion réussie !' });
            // ⚠️  On ne renvoie plus l'objet utilisateur complet
        }
    );
});

// ─── ROUTE : DÉCONNEXION ─────────────────────────────────────────────────────
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Déconnexion réussie !' });
    });
});

// ─── ROUTE : PRENDRE UN RENDEZ-VOUS ─────────────────────────────────────────
// requireAuth garantit que l'userId vient de la session, pas du client
app.post('/appointement', requireAuth, (req, res) => {
    const { dateInput, timeInput, lieuInput } = req.body;

    connection.query(
        'INSERT INTO appointement (place, hour_app, date_, state) VALUES (?, ?, ?, ?)',
        [lieuInput, timeInput, dateInput, 0],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }

            // Associer automatiquement le RDV à l'utilisateur connecté
            const id_rdv = results.insertId;
            const id_user = req.session.userId;  // ← vient de la session, pas du client

            connection.query(
                'INSERT INTO take (id_user, id_rdv) VALUES (?, ?)',
                [id_user, id_rdv],
                (err2) => {
                    if (err2) {
                        console.error(err2);
                        return res.status(500).json({ message: 'Erreur liaison RDV-user' });
                    }
                    res.json({ message: 'Rendez-vous pris avec succès !', id_rdv });
                }
            );
        }
    );
});

// ─── ROUTE : RDV DISPONIBLES (état 0, pas déjà pris/accepté) ────────────────
app.post('/rdvdispo', requireAuth, (req, res) => {
    const id_user = req.session.userId;  // ← session, pas req.body

    connection.query(
        `SELECT * FROM appointement
         WHERE state = 0
           AND id_rdv NOT IN (SELECT id_rdv FROM take   WHERE id_user = ?)
           AND id_rdv NOT IN (SELECT id_rdv FROM accept WHERE id_user = ?)`,
        [id_user, id_user],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            res.json(results);
        }
    );
});

// ─── ROUTE : ACCEPTER UN RDV ─────────────────────────────────────────────────
app.post('/changeretat', requireAuth, (req, res) => {
    const { id_rdv, newstate } = req.body;

    connection.query(
        'UPDATE appointement SET state = ? WHERE id_rdv = ?',
        [newstate, id_rdv],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            res.json({ message: 'État mis à jour' });
        }
    );
});

// ─── ROUTE : LIER USER ET RDV ACCEPTÉ ────────────────────────────────────────
app.post('/joinrdvaccept', requireAuth, (req, res) => {
    const id_user = req.session.userId;  // ← session, pas req.body
    const { id_rdv } = req.body;

    connection.query(
        'INSERT INTO accept (id_user, id_rdv) VALUES (?, ?)',
        [id_user, id_rdv],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            res.json({ message: `RDV ${id_rdv} accepté par user ${id_user}` });
        }
    );
});

// ─── ROUTE : MES RDV ACCEPTÉS ────────────────────────────────────────────────
app.post('/mesrdvAccept', requireAuth, (req, res) => {
    const id_user = req.session.userId;  // ← session, pas req.body

    connection.query(
        `SELECT appointement.* FROM appointement
         JOIN accept ON appointement.id_rdv = accept.id_rdv
         WHERE accept.id_user = ?`,
        [id_user],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
            res.json(results);
        }
    );
});

// ─── ROUTE : TOUS LES USERS (admin seulement en prod) ───────────────────────
app.get('/users', (req, res) => {
    connection.query('SELECT id_user, pseudo, email, age FROM utilisateur', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json(results);  // password hashé jamais renvoyé
    });
});