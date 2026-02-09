const loginButton = document.getElementById("loginbutton");

loginButton.addEventListener("click", () => {
    const loginInput = document.getElementById("login").value;
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

const boutonRegister = document.getElementById("register");
const myInput = document.getElementById("rlogin");
const myInput2 = document.getElementById("rpassword");
const myInput3 = document.getElementById("remail");

boutonRegister.addEventListener("click", () => {
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: myInput.value, password: myInput2.value, email: myInput3.value })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    });
});