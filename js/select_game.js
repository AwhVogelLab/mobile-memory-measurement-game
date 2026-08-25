const home_button = document.getElementById("home_button");
const normal_mode = document.getElementById("normal_mode");
const streak_mode = document.getElementById("streak_mode");

home_button.addEventListener('click', () => {
    window.location.href = "/";
});

normal_mode.addEventListener('click', () => {
    window.location.href = "/play/standard/";
});

streak_mode.addEventListener('click', () => {
    window.location.href = "/play/freeplay/";
});