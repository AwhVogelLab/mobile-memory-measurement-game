const loginButton = document.querySelector(".login_button");

const playButton = document.querySelector(".button");

loginButton.addEventListener("click", () => {
    window.location.href = "/account/log_in";
});

playButton.addEventListener("click", () => {
    window.location.href = "/play/";
});