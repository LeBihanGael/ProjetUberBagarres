const express = require('express');
const app = express();
const mysql = require('mysql2');
const ip = require('ip'); 

app.listen(4000, () => {
    let monIp = ip.address();
    console.log(`Server lecture sur http://${monIp}:4000`);
});


const connection = mysql.createConnection({
    host: '172.29.18.111',
    user: 'jsServer',
    password: 'jsServer',
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

// ROUTE POUR RECUPERER LES USERS

app.get('/users', (req, res) => {
    connection.query('SELECT * FROM User', (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Erreur serveur' });
            return;
        }
        res.json(results);
    });
});



// ROUTE POUR ENREEGISTRER UN NOUVEAU USER
app.post('/register', (req, res) => {
    const { login, email, password, age } = req.body;
    connection.query(
        'INSERT INTO utilisateur (pseudo, email, password, age) VALUES (?, ?,?, ?)',
        [ login,email, password ,age],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Erreur serveur' });
                return;
            }
            console.log({ message: 'Inscription réussie !', id_user: results.insertId });
            
        }
    );
});


// ROUTE POUR LA CONNEXION
app.post('/connexion', (req, res) => {
    const { login, password } = req.body;
    
    connection.query('SELECT * FROM utilisateur WHERE pseudo = ? AND password = ?', [login, password], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Identifiants ou mot de passe incorrects' });
        }

        res.json({ 
            message: 'Connexion réussie !', 
            utilisateur : results[0] 
        });
    });
});



// RECUPERER UN USER PAR SON ID
app.post('/connexionId', (req, res) => {
    const { userId } = req.body;
    connection.query('SELECT id, login FROM User WHERE id = ?', [userId], (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Erreur serveur' });
            return;
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Utilisateur introuvable' });
        }
    });
});