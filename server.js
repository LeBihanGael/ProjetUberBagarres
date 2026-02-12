const express = require('express');
const app = express();
const mysql = require('mysql2');
const ip = require("ip"); 

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

app.use(express.static('public')); 
app.use(express.json());


