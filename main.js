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