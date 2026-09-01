const loginButton = document.querySelector(".login_button");

const playButton = document.querySelector(".button");

playButton.addEventListener("click", () => {
    window.location.href = "/account/login";
});

playButton.addEventListener("click", () => {
    window.location.href = "/play/";
});