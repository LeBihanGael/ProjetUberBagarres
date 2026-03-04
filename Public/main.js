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

    fetch('/appointement')
    .then(response => response.json())
    .then(data => {
        const rdvList = document.getElementById("rdv-list");
        const noRdvMessage = document.getElementById("no-rdv-message");

        rdvList.innerHTML = '';

        if (Array.isArray(data) && data.length > 0) {
            noRdvMessage.style.display = "none";

            data.forEach(rdv => {
                const rdvCard = document.createElement("div");
                rdvCard.style.cssText = "background: #0b0b0b; border-radius: 8px; padding: 14px; margin-bottom: 12px; border: 1px solid rgba(212,175,55,0.08);";

                // ✅ Conversion déplacée ici, dans la boucle
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

                // after card inserted, wire up toggle button
                const toggleBtn = document.getElementById(`btn-toggle-${rdv.id}`);
                if (toggleBtn) {
                    toggleBtn.onclick = () => {
                        // determine new state value
                        const current = String(rdv.state || 'En attente').toLowerCase();
                        const newState = (current === 'confirmé' || current === '1' || current === 'true') ? 0 : 1;

                        fetch('/changeretat', {
                            method: 'Post',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: rdv.id, state: newState })
                        })
                        .then(resp => resp.json())
                        .then(result => {
                            // update UI
                            const statusDiv = document.getElementById(`status-${rdv.id}`);
                            if (statusDiv) {
                                const txt = newState === 1 ? 'confirmé' : 'En attente';
                                statusDiv.textContent = txt;
                                statusDiv.style.color = newState === 1 ? '#90EE90' : '#FFA500';
                            }
                            // also update rdv object state for next toggles
                            rdv.state = newState;
                        })
                        .catch(err => console.error('Erreur mise à jour statut:', err));
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
        localStorage.setItem('userId', data.utilisateur.id_user);
        alert(data.message);
    })
    .catch(error => console.error('Erreur:', error));
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
    })
    alert("Inscription réussie !");
});


//Js pour la prise de rendez-vous
const boutonRdv = document.getElementById("confirmrdv-modal");
const dateInput = document.getElementById("rdv-date");
const timeInput = document.getElementById("rdv-time");
const lieuInput = document.getElementById("rdv-lieu");

boutonRdv.addEventListener("click", () => {
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
    });
});

const btnlogout = document.getElementById("logout-btn");
btnlogout.addEventListener("click", () => {
    localStorage.removeItem('userId');
    alert("Déconnexion réussie !");
});
