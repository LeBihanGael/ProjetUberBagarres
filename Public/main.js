// ─── MODALS ──────────────────────────────────────────────────────────────────
document.getElementById("btn-login").onclick = () => {
    document.getElementById("login-modal").style.display = "flex";
};
document.getElementById("btn-register").onclick = () => {
    document.getElementById("register-modal").style.display = "flex";
};
document.querySelectorAll(".close").forEach(btn => {
    btn.onclick = () => {
        document.getElementById(btn.dataset.close).style.display = "none";
    };
});
window.onclick = (e) => {
    if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
    }
};

// ─── AUTH UI ─────────────────────────────────────────────────────────────────
function updateAuthUI(loggedIn) {
    const btnLogin    = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const btnLogout   = document.getElementById('btn-logout');

    if (loggedIn) {
        if (btnLogin)    btnLogin.style.display    = 'none';
        if (btnRegister) btnRegister.style.display = 'none';
        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
            btnLogout.className = 'btn-premium';
        }
    } else {
        if (btnLogin)    btnLogin.style.display    = 'inline-block';
        if (btnRegister) btnRegister.style.display = 'inline-block';
        if (btnLogout) {
            btnLogout.style.display = 'none';
            btnLogout.className = 'nav-link';
        }
    }
}

// Vérifie l'état de connexion via le serveur (plus de localStorage)
async function checkAuth() {
    const data = await fetch('/me').then(r => r.json());
    updateAuthUI(data.loggedIn);
    return data.loggedIn;
}

// ─── CONNEXION ───────────────────────────────────────────────────────────────
document.getElementById("loginpop").addEventListener("click", async () => {
    const login    = document.getElementById("login-iden").value;
    const password = document.getElementById("password").value;

    const res  = await fetch('/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
        // Le cookie de session httpOnly est géré automatiquement par le navigateur
    });
    const data = await res.json();
    alert(data.message);

    if (res.ok) {
        updateAuthUI(true);
        document.getElementById("login-modal").style.display = "none";
        document.getElementById("login-iden").value = "";
        document.getElementById("password").value   = "";
    }
});

// ─── INSCRIPTION ─────────────────────────────────────────────────────────────
document.getElementById("registerpop").addEventListener("click", async () => {
    const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            login:    document.getElementById("nameregis").value,
            password: document.getElementById("passwordregis").value,
            email:    document.getElementById("emailregis").value,
            age:      document.getElementById("ageregis").value
        })
    });
    const data = await res.json();
    alert(data.message);

    if (res.ok) {
        document.getElementById("register-modal").style.display = "none";
        ["nameregis","passwordregis","emailregis","ageregis"].forEach(id => {
            document.getElementById(id).value = "";
        });
    }
});

// ─── DÉCONNEXION ─────────────────────────────────────────────────────────────
document.getElementById("btn-logout").addEventListener("click", async () => {
    await fetch('/logout', { method: 'POST' });
    updateAuthUI(false);
    alert("Déconnexion réussie !");
});

// ─── RDV DISPONIBLES ─────────────────────────────────────────────────────────
document.getElementById("btn-afficherrdv").onclick = async () => {
    if (!(await checkAuth())) {
        alert("Veuillez vous connecter pour afficher les rendez-vous");
        document.getElementById("login-modal").style.display = "flex";
        return;
    }

    document.getElementById("afficherrdv-modal").style.display = "flex";

    // Plus d'id_user dans le body → le serveur lit req.session.userId
    const data = await fetch('/rdvdispo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json());

    const rdvList        = document.getElementById("rdv-list");
    const noRdvMessage   = document.getElementById("no-rdv-message");
    rdvList.innerHTML    = '';

    const rdvEnAttente = Array.isArray(data) ? data : [];

    if (rdvEnAttente.length > 0) {
        noRdvMessage.style.display = "none";

        rdvEnAttente.forEach(rdv => {
            const rdvCard = document.createElement("div");
            rdvCard.style.cssText = "background:#0b0b0b;border-radius:8px;padding:14px;margin-bottom:12px;border:1px solid rgba(212,175,55,0.08);";

            const newDate     = rdv.date_ ? new Date(rdv.date_).toLocaleDateString('fr-CA') : 'N/A';
            const statusText  = rdv.state || 'En attente';
            const statusColor = String(statusText).toLowerCase() === 'confirmé' ? '#90EE90' : '#FFA500';

            rdvCard.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:160px;">
                        <div style="color:#DDD;font-size:0.95rem;">
                            <div><strong style="color:#FFD700;">Date:</strong> ${newDate}</div>
                            <div><strong style="color:#FFD700;">Heure:</strong> ${rdv.hour_app || 'N/A'}</div>
                            <div><strong style="color:#FFD700;">Lieu:</strong> ${rdv.place || 'N/A'}</div>
                        </div>
                    </div>
                    <div style="text-align:right;min-width:120px;">
                        <div style="font-size:0.9rem;color:#DDD;">Statut</div>
                        <div style="margin-top:6px;font-weight:700;color:${statusColor};">${statusText}</div>
                        <button class="btn-premium" style="margin-top:8px;font-size:0.7rem;padding:4px 8px;" data-id="${rdv.id_rdv || rdv.id}">Changer</button>
                    </div>
                </div>`;

            rdvList.appendChild(rdvCard);

            rdvCard.querySelector('button').onclick = async () => {
                const id_rdv = rdv.id_rdv || rdv.id;

                await fetch('/changeretat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_rdv, newstate: 1 })
                });

                // userId lu depuis la session côté serveur, pas envoyé depuis le client
                await fetch('/joinrdvaccept', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_rdv })
                });

                alert("Rendez-vous accepté !");
                document.getElementById("btn-afficherrdv").click();
            };
        });
    } else {
        noRdvMessage.style.display = "block";
    }
};

// ─── RDV ACCEPTÉS ────────────────────────────────────────────────────────────
document.getElementById("btn-afficherrdv-acceptes").onclick = async () => {
    if (!(await checkAuth())) {
        alert("Veuillez vous connecter pour afficher vos rendez-vous acceptés");
        document.getElementById("login-modal").style.display = "flex";
        return;
    }

    document.getElementById("afficherrdv-acceptes-modal").style.display = "flex";

    // Plus d'id_user dans le body
    const data = await fetch('/mesrdvAccept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json());

    const rdvAcceptesList       = document.getElementById("rdv-acceptes-list");
    const noRdvAcceptesMessage  = document.getElementById("no-rdv-acceptes-message");
    rdvAcceptesList.innerHTML   = '';

    if (Array.isArray(data) && data.length > 0) {
        noRdvAcceptesMessage.style.display = "none";

        data.forEach(rdv => {
            const rdvCard = document.createElement("div");
            rdvCard.style.cssText = "background:#0b0b0b;border-radius:8px;padding:14px;margin-bottom:12px;border:1px solid rgba(212,175,55,0.08);";
            const newDate = rdv.date_ ? new Date(rdv.date_).toLocaleDateString('fr-CA') : 'N/A';

            rdvCard.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:160px;">
                        <div style="color:#DDD;font-size:0.95rem;">
                            <div><strong style="color:#FFD700;">Date:</strong> ${newDate}</div>
                            <div><strong style="color:#FFD700;">Heure:</strong> ${rdv.hour_app || 'N/A'}</div>
                            <div><strong style="color:#FFD700;">Lieu:</strong> ${rdv.place || 'N/A'}</div>
                        </div>
                    </div>
                    <div style="text-align:right;min-width:120px;">
                        <div style="font-size:0.9rem;color:#DDD;">Statut</div>
                        <div style="margin-top:6px;font-weight:700;color:#90EE90;">Confirmé</div>
                    </div>
                </div>`;

            rdvAcceptesList.appendChild(rdvCard);
        });
    } else {
        noRdvAcceptesMessage.style.display = "block";
    }
};

// ─── CRÉER UN RDV ─────────────────────────────────────────────────────────────
document.getElementById("btn-creerrdv").onclick = async () => {
    if (!(await checkAuth())) {
        alert("Veuillez vous connecter avant de prendre un rendez-vous");
        document.getElementById("login-modal").style.display = "flex";
        return;
    }
    document.getElementById('creerrdv-modal').style.display = 'flex';
};

document.getElementById("confirmrdv-modal").addEventListener("click", async () => {
    if (!(await checkAuth())) {
        alert("Veuillez vous connecter avant de prendre un rendez-vous");
        return;
    }

    const res = await fetch('/appointement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dateInput: document.getElementById("rdv-date").value,
            timeInput: document.getElementById("rdv-time").value,
            lieuInput: document.getElementById("rdv-lieu").value
            // Plus besoin d'envoyer userId ni state : gérés côté serveur
        })
    });
    const data = await res.json();
    alert(data.message);

    if (res.ok) {
        document.getElementById('creerrdv-modal').style.display = 'none';
        ["rdv-date","rdv-time","rdv-lieu"].forEach(id => {
            document.getElementById(id).value = "";
        });
    }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
checkAuth();