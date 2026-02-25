//Js pour les popups de connexion et d'inscription (code non fait avec de l'ia mais avec des recherche sur internet)
// Ouvrir les modals
document.getElementById("btn-login").onclick = () => {
    document.getElementById("login-modal").style.display = "flex";
};

document.getElementById("btn-register").onclick = () => {
    document.getElementById("register-modal").style.display = "flex";
};

//Js pour afficher les rendez-vous
document.getElementById("btn-afficherrdv").onclick = () => {
    document.getElementById("afficherrdv-modal").style.display = "flex";
    
    const userId = localStorage.getItem('userId') || '1';

    fetch('data.json', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(allData => {
        const rdvList = document.getElementById("rdv-list");
        const noRdvMessage = document.getElementById("no-rdv-message");
        
        rdvList.innerHTML = '';
        
        // Récupérer les rdv de l'utilisateur
        const userRdv = allData[userId] || [];
        
        if (userRdv && Array.isArray(userRdv) && userRdv.length > 0) {
            noRdvMessage.style.display = "none";
            
            userRdv.forEach(rdv => {
                const rdvCard = document.createElement("div");
                rdvCard.style.cssText = "border: 1px solid #000000; border-radius: 8px; padding: 15px; margin-bottom: 10px; background-color: #000000;";
                
                rdvCard.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <p style="margin: 5px 0; color: #FFD700;"><strong>Pseudo:</strong> ${rdv.pseudo || 'N/A'}</p>
                            <p style="margin: 5px 0; color: #FFD700;"><strong>Date:</strong> ${rdv.date || 'N/A'}</p>
                            <p style="margin: 5px 0; color: #FFD700;"><strong>Heure:</strong> ${rdv.time || 'N/A'}</p>
                            <p style="margin: 5px 0; color: #FFD700;"><strong>Lieu:</strong> ${rdv.lieu || 'N/A'}</p>
                            <p style="margin: 5px 0; color: #FFD700;"><strong>Email:</strong> ${rdv.email || 'N/A'}</p>
                            <p style="margin: 5px 0; color: #FFD700;"><strong>Description:</strong> ${rdv.description || 'Aucune description'}</p>
                            <p style="margin: 5px 0; color: #FFD700;"><strong>Status:</strong> <span style="color: ${rdv.status === 'confirmé' ? '#90EE90' : '#FFA500'}">${rdv.status || 'En attente'}</span></p>
                        </div>
                    </div>
                `;
                
                rdvList.appendChild(rdvCard);
            });
        } else {
            noRdvMessage.style.display = "block";
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        document.getElementById("no-rdv-message").style.display = "block";
    });
};

// Fermer les modals
document.querySelectorAll(".close").forEach(btn => {
    btn.onclick = () => {
        document.getElementById(btn.dataset.close).style.display = "none";
    };
});

// Fermer en cliquant en dehors
window.onclick = (e) => {
    if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
    }
};


const loginButton = document.getElementById("loginpop");
const boutonlog = document.getElementById("btn-login");
loginButton.addEventListener("click", () => {
    const loginInput = document.getElementById("login-iden").value;
    const passwordInput = document.getElementById("password").value;

    fetch('/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginInput, password: passwordInput })
    })
    .then(response => response.json())
    .then(data => {
        if (data.utilisateur) {
            localStorage.setItem('userId', data.utilisateur.id_user);
            localStorage.setItem('userpseudo', data.utilisateur.pseudo);
            boutonlog.innerHTML = "Profil";
            updateUI();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Erreur:', error));
});

const logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userpseudo');
});


// Js pour l'inscription
const boutonRegister = document.getElementById("registerpop");
const myInput = document.getElementById("nameregis");
const myInput2 = document.getElementById("passwordregis");
const myInput3 = document.getElementById("emailregis");
const myInput4 = document.getElementById("ageregis");

boutonRegister.addEventListener("click", () => {
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: myInput.value, password: myInput2.value, email: myInput3.value, age: myInput4.value })
    })
    .then(response => response.json())
    .then(data => {
        alert(data);
    });
    alert("Inscription réussie ! ID utilisateur : " + results.insertId);
});


//Js pour la prise de rendez-vous
const boutonRdv = document.getElementById("confirmrdv");
const pseudoInput = document.getElementById("pseudo");
const emailInput = document.getElementById("email");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const lieuInput = document.getElementById("lieu");

boutonRdv.addEventListener("click", () => {
    fetch('/rdv', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pseudoInput: pseudoInput.value, emailInput: emailInput.value, dateInput: dateInput.value, timeInput: timeInput.value, lieuInput: lieuInput.value })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
    });
});



