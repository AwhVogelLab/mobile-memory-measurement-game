import {
    canvas,
    canvas_size,
    ctx,
    img_size,
    imageCache,
    image_folders,
    colors,
    shape_folder,
    sounds,
    audioContext,
    sleep,
    distance
} from "./globals.js";

import { Game, preloadImages } from "./game.js";

async function setup() {
    
    await preloadImages();

    await loadSound("correct", "/audio/correct_answer2.mp3");
    await loadSound("incorrect", "/audio/incorrect_answer.mp3");

    create_start_button();
    
}

function create_start_button() {
    const container = document.getElementById("canvasContainer");
    container.style.width = canvas_size + "px";
    container.style.height = canvas_size + "px";
    //console.log(container.height)

    const buttonContainer = document.createElement("div");

    buttonContainer.style.position = "absolute";
    buttonContainer.style.top = "50%";
    buttonContainer.style.left = "50%";
    buttonContainer.style.transform = "translate(-50%, -50%)";
    buttonContainer.style.zIndex = "10";
    [4,5].forEach(val => {
        const btn = document.createElement("button");
        btn.classList.add("startButton");
        btn.style.padding = "10px 20px";
        btn.style.fontSize = "64px";
        btn.innerText = `Start (${val})`
        btn.addEventListener('click', () => {
            start_game(val);
            buttonContainer.remove();
            let divsToHide = document.getElementsByClassName("instructions");
            for (let v = 0; v<divsToHide.length; v++){
                divsToHide[v].hidden = true;
            }
        })

        buttonContainer.appendChild(btn);
    
    });

    container.appendChild(buttonContainer);
}

async function start_game(num) {
    const game = new Game([], 0, -1, num);
    await game.start_game();

    console.log(game);

    game.delete_bubbles();

    end_screen(game);

}

function end_screen(game) {
    // document.getElementById("gameLayout").hidden = true;
    // document.getElementById("gameLayout").style.display = "none";
    // document.getElementById("canvasContainer").hidden = true;
    // document.getElementById("infoPanel").hidden = true;

    document.getElementById("resultsScreen").hidden = false;

    document.getElementById("result_correct").textContent = `Correct: ${game.num_correct}/${game.num_correct+game.num_wrong}`;

    document.getElementById("result_streak").textContent = `Max Streak: ${game.max_streak}`;

    document.getElementById("result_score").textContent = `Points: ${game.points}`;
}

async function loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    sounds.set(name, buffer);
}

function createSlider(min, max, start, step, num, func, labelText){
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "8px";

    const label = document.createElement("label");
    label.textContent = labelText;

    const slider = document.createElement("input");

    slider.type = "range";
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.value = String(start);


    slider.addEventListener("input", () => {
        func(Number(slider.value));
    });

    container.style.position = "absolute"
    container.style.left = "10px"
    container.style.bottom = 10 + 20 * num + "px"
    container.style.zIndex = "10"
    container.style.width = canvas_size + "px";

    slider.style.flex = "1";
    slider.style.minWidth = "0";

    container.appendChild(label);
    container.appendChild(slider);

    return container;

}

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("play_again").addEventListener("click", () => {
        document.getElementById("resultsScreen").hidden = true;

        canvas.style.border = "5px solid #b8c1ec";
        create_start_button();
    });
    setup();
});