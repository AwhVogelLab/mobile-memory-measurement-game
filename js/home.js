const statsButton = document.querySelector(".shapes_correct_box");
const playButton = document.querySelector(".play_button");

statsButton.addEventListener("click", () => {
    window.location.href = "/stats/";
});

playButton.addEventListener("click", () => {
    window.location.href = "/play/standard/";
});