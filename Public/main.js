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


//Js pour la connexion
const loginButton = document.getElementById("loginpop");

loginButton.addEventListener("click", () => {
    const loginInput = document.getElementById("login-iden").value;
    const passwordInput = document.getElementById("password").value;

    fetch('/connexion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: loginInput, password: passwordInput })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        alert("ID utilisateur : " + data.user.id);
        localStorage.setItem('userId', data.user.id);
    });
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
    .then(response => response.text())
    .then(data => {
        alert(data);
    });
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