const profileIcon = document.querySelector(".profile_icon");
const statsButton = document.querySelector(".shapes_correct_box");
const playButton = document.querySelector(".play_button");

profileIcon.addEventListener("click", () => {
    window.location.href = "/stats/";
});

statsButton.addEventListener("click", () => {
    window.location.href = "/stats/";
});

playButton.addEventListener("click", () => {
    window.location.href = "/play/standard/";
});