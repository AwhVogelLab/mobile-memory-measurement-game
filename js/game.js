//For holding links to the files
const shape_folder = "../shapes_updated/";
const image_folders = ["circle", "cog", "crescent", "horizontal", 
                        "square", "triangle", "vertical_rectangle", "x"];
const colors = ["black", "blue", "cyan", "green", "magenta", 
                "orange", "red", "white", "yellow"];

//creating a cache for images
const imageCache = new Map();

//create canvas object
const canvas = document.getElementById("myCanvas");
let canvas_size = Math.min(window.innerHeight - 200, window.innerWidth - 100);
canvas.width = canvas_size;
canvas.height = canvas_size;
const ctx = canvas.getContext("2d");

//create audio holder
const audioContext = new AudioContext();
const sounds = new Map();

let img_size = 0.2 * canvas_size;

//pauses for specified ms
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//shape object
class Shape_obj{

    static nextId = 0;

    /**
     * @param {[float, float]} position
     * @param {string} shape
     * @param {string} color
     */
    constructor(position, shape, color){
        this.id = Shape_obj.nextId++;
        this.position = position;
        this.shape = shape;
        this.color = color;
    }

    set_position(pos) {
        this.position = pos
    }
    set_shape(shape){
        this.shape = shape
    }
    set_color(color){
        this.color = color
    }
    //obtains source for the image
    get_src() {
        return `${shape_folder}${this.shape}/${this.shape}_${this.color}.png`;
    }
    //draws image on the canvas
    draw(ctx, size) {
        const img = imageCache.get(this.get_src());

        if (!img) {
            console.error("Missing image:", this.get_src());
            return;
        }

        ctx.drawImage(img, this.position[0], this.position[1], size, size)
    }
    //creates a button on the canvas
    create_button(size, onClick) {
        const container = document.getElementById("canvasContainer");

        const button = document.createElement("button");
        button.style.position = "absolute";
        button.style.border = "none";
        button.style.background = "none";
        button.style.padding = "0";
        button.style.cursor = "pointer";
        button.style.left = (this.position[0] + 1) + "px";
        button.style.top = (this.position[1] + 1) + "px";

        const cached_img = imageCache.get(this.get_src());
        const img = cached_img.cloneNode();
        img.width = size;
        img.height = size;

        button.appendChild(img);

        button.addEventListener("click", () => {
            onClick(this);
        });

        container.appendChild(button);

        button.classList.add("shape-button");

        return button;
    }
    //moves the shape's position by dx, dy
    move(dx, dy) {
        this.position[0] += dx;
        this.position[1] += dy;
    }

} 

class Round{

    static nextId = 0;

    /**
     * @param {[Shape_obj]} shapes
     * @param {[string]} remaining_shapes
     * @param {[string]} remaining_colors
     * @param {boolean} drawn
     * @param {boolean} drawn_as_button
     * @var {Shape_obj} shape_changed
     * @var {Boolean} correct
     */
    constructor(shapes, remaining_shapes, remaining_colors, drawn=false, drawn_as_button=false) {
        this.id = Round.nextId++;
        this.shapes = shapes;
        this.remaining_shapes = remaining_shapes;
        this.remaining_colors = remaining_colors;
        this.drawn = drawn;
        this.drawn_as_button = drawn_as_button;
        this.shape_changed;
        this.correct;
    }

    change_one_shape(s){
        this.shapes[s].set_shape(this.remaining_shapes[Math.floor(Math.random()*this.remaining_shapes.length)])
        this.shape_changed = this.shapes[s]
        //console.log("shape", s)
    }
    change_one_color(s){
        this.shapes[s].set_color(this.remaining_colors[Math.floor(Math.random()*this.remaining_colors.length)])
        this.shape_changed = this.shapes[s]
        //console.log("color", s)
    }

    draw_images(){
        for (let i = 0; i < this.shapes.length; i++){
            this.shapes[i].draw(ctx, img_size)
        }
        this.drawn = true;
    }
    display_buttons(click_event){
        for (let i = 0; i < this.shapes.length; i++){
            this.shapes[i].create_button(img_size, click_event);
        }
        this.drawn_as_button = true;
    }
    clear_drawings(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawn = false;
    }
    clear_buttons(){
        document.querySelectorAll(".shape-button").forEach(button => {
            button.remove();
        });
        this.drawn_as_button = false;
    }
}

class Game{
    /**
     * @param {[Round]} rounds
     * @param {Integer} current_round
     * @param {Integer} max_rounds
     * @param {Integer} num_correct
     * @param {Integer} num_wrong
     * @param {Integer} streak
     * @param {Integer} max_streak
     */
    constructor(rounds = [], current_round = 0, max_rounds = 20, num_correct = 0, num_wrong = 0, streak = 0, max_streak = 0, points = 0){
        this.rounds = rounds;
        this.current_round = current_round;
        this.max_rounds = max_rounds;
        this.num_correct = num_correct;
        this.num_wrong = num_wrong;
        this.streak = streak;
        this.max_streak = max_streak;
        this.points = points;
    }

    generate_shapes(num) {
        //used to track the location of shapes and make sure shapes do not overlap
        let images = [];
        let temp_image_folders = [...image_folders];
        let temp_colors = [...colors];
        
        for (let i = 0; i < num; i++){
            //create image variable
            let image = new Shape_obj();

            //randomly chooses an image to use
            let s_item = Math.floor(Math.random() * temp_image_folders.length);
            image.shape = temp_image_folders.splice(s_item, 1)[0];
            //randomly chooses a color
            let c_item = Math.floor(Math.random() * temp_colors.length);
            image.color = temp_colors.splice(c_item, 1)[0];
            

            //places it randomly on the canvas
            let x;
            let y;
            let rerandomize = true
            let attempts = 0;
            let maxAttempts = 1000;
            do{
                rerandomize = false
                x = Math.random() * (canvas_size - img_size);
                y = Math.random() * (canvas_size - img_size);
                //If the shape is too close to another, it will relocate it
                for (let j = 0; j < images.length; j++){
                    if (distance([x, y], images[j].position) < distance([0, 0], [img_size*1.2, img_size*1.2])){
                        rerandomize = true;
                        break;
                    }
                }
                attempts++;
            } while (rerandomize && attempts < maxAttempts)

            if (attempts >= maxAttempts) {
                console.log("Could not place shape after", maxAttempts, "attempts");
                return null; 
            }

            image.position = [x, y];

            //console.log(image);

            //add shape to array
            images.push(image)
        }
        //console.log(images)            

        let new_round = new Round(images, temp_image_folders, temp_colors)

        return new_round
    }   

    new_round(num_shapes){
        const maxRetries = 5;

        for (let retry = 0; retry < maxRetries; retry++) {
            const round = this.generate_shapes(num_shapes);

            if (round !== null) {
                this.rounds.push(round);
                return true;
            }

            console.warn(`Round generation failed, retry ${retry + 1}/${maxRetries}`);
        }

        console.error("Could not generate round");
        return false;
    }

    calculate_points(reaction_time){
        let p = 2 /((reaction_time/1000) + 1);
        p *= Math.log(this.streak+1);
        this.points += Math.trunc(p * 1000);
    }

    async button_functionality(clicked_shape, reaction_time){
        if (clicked_shape === this.rounds[this.current_round].shape_changed) {
            //correct shape chosen
            this.rounds[this.current_round].correct = true;
            this.num_correct++;
            playSound("correct", 0.5, 1 + Math.min(this.streak, 4) * 0.025);
            this.streak++;
            this.max_streak = Math.max(this.streak, this.max_streak);
            this.calculate_points(reaction_time);
            canvas.style.border = "5px solid green";
        } else {
            //incorrect shape chosen
            this.rounds[this.current_round].correct = false;
            this.num_wrong++;
            this.streak = 0;
            playSound("incorrect", 0.5);
            canvas.style.border = "5px solid red";
        }
        this.rounds[this.current_round].clear_buttons();
    }

    async start_game(){
        while (this.current_round < this.max_rounds) {
            this.new_round(5);
            await this.start_round();

            this.current_round++;
            this.updateStats();

            await sleep(800);
            canvas.style.border = "5px solid #b8c1ec";
            await sleep(200);
        }

        return this;
    }

    async start_round(){
        this.rounds[this.current_round].draw_images();
        await sleep(300)
        this.rounds[this.current_round].clear_drawings();
        await sleep(1000)

        let s = Math.floor(Math.random()*5);
        if (Math.random() > 0.5) {
            this.rounds[this.current_round].change_one_shape(s)
        }
        else {
            this.rounds[this.current_round].change_one_color(s)
        }
        await new Promise((resolve) => {
            let start_time = performance.now();
            this.rounds[this.current_round].display_buttons(async (clicked_shape) => {
                let reaction_time = performance.now() - start_time;
                await this.button_functionality(clicked_shape, reaction_time);
                resolve();
            });
        });
        
    }

    getAccuracyColor(pct) {
        // red → yellow → green
        const r = pct < 50 ? 255 : Math.floor(255 - (pct - 50) * 5.1);
        const g = pct < 50 ? Math.floor(pct * 5.1) : 255;
        return `rgb(${r}, ${g}, 0)`;
    }

    updateStats(){
        document.getElementById("roundDisplay").textContent =
        `Round: ${this.current_round+1}`;

        document.getElementById("pointDisplay").textContent =
        `Points: ${this.points}`;

        document.getElementById("maxStreakDisplay").textContent =
        `Best streak: ${this.max_streak}`;
    }

}

async function setup() {
    
    await preloadImages();

    await loadSound("correct", "../audio/correct_answer2.mp3");
    await loadSound("incorrect", "../audio/incorrect_answer.mp3");

    create_start_button();
    
}

function create_start_button() {
    const container = document.getElementById("canvasContainer");
    container.style.width = canvas_size + "px";
    container.style.height = canvas_size + "px";
    //console.log(container.height)
    const btn = document.createElement("button");
    btn.classList.add("startButton");
    btn.style.position = "absolute";
    btn.style.top = "50%";
    btn.style.left = "50%";
    btn.style.transform = "translate(-50%, -50%)";
    btn.style.padding = "10px 20px";
    btn.style.zIndex = "10";
    btn.style.fontSize = "64px";
    btn.innerText = "Start"
    btn.addEventListener('click', () => {
        start_game();
        btn.remove();
    });

    container.appendChild(btn);
}

function distance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2))
}

async function start_game() {
    num = 5;
    game = new Game();
    /*document.body.appendChild(createSlider(0.08, 0.2, 0.15, 0.002, 0, 
        (value) => {
            img_size = canvas_size * value;
            if (game.rounds[game.current_round].drawn == true){
                game.rounds[game.current_round].clear_drawings()
                game.rounds[game.current_round].draw_images()
            }
            if (game.rounds[game.current_round].drawn_as_button == true){
                game.rounds[game.current_round].clear_buttons()
                game.rounds[game.current_round].display_buttons((clicked_shape) => 
                    game.button_functionality(clicked_shape))
            }

        }, "Shape Size")
    );*/
    const result = await game.start_game();
    console.log(result);
    

}

async function loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    sounds.set(name, buffer);
}

async function preloadImages() {
    const promises = [];

    for (const shape of image_folders) {
        for (const color of colors) {
            const src = `${shape_folder}${shape}/${shape}_${color}.png`;

            const img = new Image();

            const promise = new Promise((resolve, reject) => {
                img.onload = () => {
                    imageCache.set(src, img);
                    resolve();
                };
                img.onerror = reject;
            });

            img.src = src;
            promises.push(promise);
        }
    }

    await Promise.all(promises);
}

function playSound(name, volume = 1, pitch = 1) {
    const buffer = sounds.get(name);
    if (!buffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch;

    const gain = audioContext.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(audioContext.destination);

    source.start();
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
    setup();
});