//Js pour les popups de connexion et d'inscription (code non fait avec de l'ia mais avec des recherche sur internet)
// Ouvrir les modals
document.getElementById("btn-login").onclick = () => {
    document.getElementById("login-modal").style.display = "flex";
};

document.getElementById("btn-register").onclick = () => {
    document.getElementById("register-modal").style.display = "flex";
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

//Js pour afficher les rendez-vous
document.getElementById("btn-afficherrdv").onclick = () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert("Veuillez vous connecter pour afficher les rendez-vous");
        document.getElementById("login-modal").style.display = "flex";
        return;
    }
    
    document.getElementById("afficherrdv-modal").style.display = "flex";

    fetch('/rdvdispo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user: userId })
    })
    .then(response => response.json())
    .then(data => {
        const rdvList = document.getElementById("rdv-list");
        const noRdvMessage = document.getElementById("no-rdv-message");

        rdvList.innerHTML = '';

        // Plus besoin de filtrer, le serveur le fait déjà
        const rdvEnAttente = Array.isArray(data) ? data : [];

        if (rdvEnAttente.length > 0) {
            noRdvMessage.style.display = "none";

            rdvEnAttente.forEach(rdv => {
                const rdvCard = document.createElement("div");
                rdvCard.style.cssText = "background: #0b0b0b; border-radius: 8px; padding: 14px; margin-bottom: 12px; border: 1px solid rgba(212,175,55,0.08);";

                const newDate = rdv.date_
                    ? new Date(rdv.date_).toLocaleDateString('fr-CA') // Format YYYY-MM-DD
                    : 'N/A';

                const statusText = rdv.state || 'En attente';
                const statusLower = String(statusText).toLowerCase();
                const statusColor = (statusLower === 'confirmé') ? '#90EE90' : '#FFA500';

                rdvCard.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:160px;">
                            <div style="color:#DDD; font-size:0.95rem;">
                                <div><strong style="color:#FFD700;">Date:</strong> ${newDate}</div>
                                <div><strong style="color:#FFD700;">Heure:</strong> ${rdv.hour_app || 'N/A'}</div>
                                <div><strong style="color:#FFD700;">Lieu:</strong> ${rdv.place || 'N/A'}</div>
                            </div>
                        </div>
                        <div style="text-align:right; min-width:120px;">
                            <div style="font-size:0.9rem; color:#DDD;">Statut</div>
                            <div style="margin-top:6px; font-weight:700; color:${statusColor};" id="status-${rdv.id}">${statusText}</div>
                            <button class="btn-premium" style="margin-top:8px; font-size:0.7rem; padding:4px 8px;" id="btn-toggle-${rdv.id}">Changer</button>
                        </div>
                    </div>
                `;

                rdvList.appendChild(rdvCard);

                // Ajouter l'event listener au bouton Changer
                const toggleBtn = document.getElementById(`btn-toggle-${rdv.id}`);
                if (toggleBtn) {
                    toggleBtn.onclick = () => {
                        const userId = localStorage.getItem('userId');
                        
                        if (!userId) {
                            alert("Veuillez vous connecter pour accepter un rendez-vous");
                            return;
                        }

                        // Changer l'état du RDV à 1
                        fetch('/changeretat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_rdv: rdv.id_rdv || rdv.id, newstate: 1 })
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                            // Associer l'utilisateur au RDV accepté
                            return fetch('/joinrdvaccept', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id_user: userId, id_rdv: rdv.id_rdv || rdv.id })
                            });
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                            alert("Rendez-vous accepté !");
                            // Rafraîchir l'affichage
                            document.getElementById("btn-afficherrdv").click();
                        })
                        .catch(error => {
                            console.error('Erreur:', error);
                            alert("Erreur lors de l'acceptation du rendez-vous");
                        });
                    };
                }
            });
        } else {
            noRdvMessage.style.display = "block";
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        document.getElementById("no-rdv-message").style.display = "block";
    });
};

//Js pour afficher les rendez-vous acceptés (état = 1)
document.getElementById("btn-afficherrdv-acceptes").onclick = () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert("Veuillez vous connecter pour afficher vos rendez-vous acceptés");
        document.getElementById("login-modal").style.display = "flex";
        return;
    }
    
    document.getElementById("afficherrdv-acceptes-modal").style.display = "flex";

    fetch('/mesrdvAccept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_user: userId })
    })
    .then(response => response.json())
    .then(data => {
        const rdvAcceptesList = document.getElementById("rdv-acceptes-list");
        const noRdvAcceptesMessage = document.getElementById("no-rdv-acceptes-message");

        rdvAcceptesList.innerHTML = '';

        if (Array.isArray(data) && data.length > 0) {
            noRdvAcceptesMessage.style.display = "none";

            data.forEach(rdv => {
                const rdvCard = document.createElement("div");
                rdvCard.style.cssText = "background: #0b0b0b; border-radius: 8px; padding: 14px; margin-bottom: 12px; border: 1px solid rgba(212,175,55,0.08);";

                const newDate = rdv.date_
                    ? new Date(rdv.date_).toLocaleDateString('fr-CA')
                    : 'N/A';

                rdvCard.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:160px;">
                            <div style="color:#DDD; font-size:0.95rem;">
                                <div><strong style="color:#FFD700;">Date:</strong> ${newDate}</div>
                                <div><strong style="color:#FFD700;">Heure:</strong> ${rdv.hour_app || 'N/A'}</div>
                                <div><strong style="color:#FFD700;">Lieu:</strong> ${rdv.place || 'N/A'}</div>
                            </div>
                        </div>
                        <div style="text-align:right; min-width:120px;">
                            <div style="font-size:0.9rem; color:#DDD;">Statut</div>
                            <div style="margin-top:6px; font-weight:700; color:#90EE90;">Confirmé</div>
                        </div>
                    </div>
                `;

                rdvAcceptesList.appendChild(rdvCard);
            });
        } else {
            noRdvAcceptesMessage.style.display = "block";
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        document.getElementById("no-rdv-acceptes-message").style.display = "block";
    });
};




// helper pour mettre à jour les boutons en fonction de l'état de connexion
function updateAuthUI() {
    const loggedIn = !!localStorage.getItem('userId');
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const btnLogout = document.getElementById('btn-logout');
    if (loggedIn) {
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnRegister) btnRegister.style.display = 'none';
        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
            btnLogout.className = 'btn-premium';
        }
    } else {
        if (btnLogin) btnLogin.style.display = 'inline-block';
        if (btnRegister) btnRegister.style.display = 'inline-block';
        if (btnLogout) {
            btnLogout.style.display = 'none';
            btnLogout.className = 'nav-link';
        }
    }
}

const loginButton = document.getElementById("loginpop");
if (loginButton) {
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
            localStorage.setItem('userId', data.utilisateur.id_user);
            alert(data.message);
            updateAuthUI();
            document.getElementById("login-modal").style.display = "none";
            document.getElementById("login-iden").value = "";
            document.getElementById("password").value = "";
        })
        .catch(error => console.error('Erreur:', error));
    });
}



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
        alert("Inscription réussie !");
        document.getElementById("register-modal").style.display = "none";
        myInput.value = "";
        myInput2.value = "";
        myInput3.value = "";
        myInput4.value = "";
    })
});


//Js pour ouvrir la modale de création de RDV
document.getElementById("btn-creerrdv").onclick = () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert("Veuillez vous connecter avant de prendre un rendez-vous");
        document.getElementById("login-modal").style.display = "flex";
        return;
    }
    
    document.getElementById('creerrdv-modal').style.display='flex';
};

//Js pour la prise de rendez-vous
const boutonRdv = document.getElementById("confirmrdv-modal");
const dateInput = document.getElementById("rdv-date");
const timeInput = document.getElementById("rdv-time");
const lieuInput = document.getElementById("rdv-lieu");

boutonRdv.addEventListener("click", () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert("Veuillez vous connecter avant de prendre un rendez-vous");
        return;
    }
    
    fetch('/appointement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dateInput: dateInput.value, timeInput: timeInput.value, lieuInput: lieuInput.value , state : 0})
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert(data.message);
        return fetch('/joinrdv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_user: userId, id_rdv: data.id_rdv })
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert(data.message);
        document.getElementById('creerrdv-modal').style.display='none';
        dateInput.value = "";
        timeInput.value = "";
        lieuInput.value = "";
    })
    .catch(error => console.error('Erreur:', error));
});




const btnlogout = document.getElementById("btn-logout");
if (btnlogout) {
    btnlogout.addEventListener("click", () => {
        localStorage.removeItem('userId');
        alert("Déconnexion réussie !");
        updateAuthUI();
    });
}

// mettre à jour l'affichage dès le chargement
updateAuthUI();

