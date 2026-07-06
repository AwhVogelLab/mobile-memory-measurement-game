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

//shape object
export class Shape_obj{

    static nextId = 0;

    /**
     * @param {[float, float]} position
     * @param {string} shape
     * @param {string} color
     * @var {string} prev_shape
     * @var {string} prev_color
     */
    constructor(position, shape, color){
        this.id = Shape_obj.nextId++;
        this.position = position;
        this.shape = shape;
        this.color = color;
        this.prev_shape = null;
        this.prev_color = null;
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

export class Round{

    static nextId = 0;

    /**
     * @param {[Shape_obj]} shapes
     * @param {[string]} remaining_shapes
     * @param {[string]} remaining_colors
     * @param {boolean} drawn
     * @param {boolean} drawn_as_button
     * @param {Number} reaction_time
     * @var {Shape_obj} shape_changed
     * @var {string} changed_attribute
     * @var {Boolean} correct
     */
    constructor(shapes, remaining_shapes, remaining_colors, drawn=false, drawn_as_button=false, reaction_time=0) {
        this.id = Round.nextId++;
        this.shapes = shapes;
        this.remaining_shapes = remaining_shapes;
        this.remaining_colors = remaining_colors;
        this.drawn = drawn;
        this.drawn_as_button = drawn_as_button;
        this.reaction_time = reaction_time;
        this.shape_changed = null;
        this.changed_attribute = null;
        this.correct = null;
    }

    change_one_shape(s){
        this.shapes[s].prev_shape = this.shapes[s].shape;
        this.shapes[s].set_shape(this.remaining_shapes[Math.floor(Math.random()*this.remaining_shapes.length)])
        this.shape_changed = this.shapes[s]
        this.changed_attribute = "shape";
        //console.log("shape", s)
    }
    change_one_color(s){
        this.shapes[s].prev_color = this.shapes[s].color;
        this.shapes[s].set_color(this.remaining_colors[Math.floor(Math.random()*this.remaining_colors.length)])
        this.shape_changed = this.shapes[s]
        this.changed_attribute = "color";
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

export class Game{
    /**
     * @param {[Round]} rounds
     * @param {Integer} current_round
     * @param {Integer} max_rounds
     * @param {Integer} num_correct
     * @param {Integer} num_wrong
     * @param {Integer} streak
     * @param {Integer} max_streak
     */
    constructor(rounds = [], current_round = 0, max_rounds = 20, num_shapes = 5, num_correct = 0, num_wrong = 0, streak = 0, max_streak = 0, points = 0){
        this.rounds = rounds;
        this.current_round = current_round;
        this.max_rounds = max_rounds;
        this.num_shapes = num_shapes;
        this.num_correct = num_correct;
        this.num_wrong = num_wrong;
        this.streak = streak;
        this.max_streak = max_streak;
        this.points = points;
    }

    generate_shapes() {
        //used to track the location of shapes and make sure shapes do not overlap
        let images = [];
        let temp_image_folders = [...image_folders];
        let temp_colors = [...colors];
        
        for (let i = 0; i < this.num_shapes; i++){
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

    new_round(){
        const maxRetries = 5;

        for (let retry = 0; retry < maxRetries; retry++) {
            const round = this.generate_shapes(this.num_shapes);

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

    async button_functionality(clicked_shape){
        if (clicked_shape === this.rounds[this.current_round].shape_changed) {
            //correct shape chosen
            this.rounds[this.current_round].correct = true;
            this.num_correct++;
            playSound("correct", 0.5, 1 + Math.min(this.streak, 4) * 0.025);
            this.streak++;
            this.max_streak = Math.max(this.streak, this.max_streak);
            this.calculate_points(this.rounds[this.current_round].reaction_time);
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
        while ((this.current_round < this.max_rounds) || this.max_rounds === -1) {
            this.new_round();
            await this.start_round();

            if (this.max_rounds === -1 && this.rounds[this.current_round].correct === false) {
                break;
            }

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

        let s = Math.floor(Math.random()*this.num_shapes);
        if (Math.random() > 0.5) {
            this.rounds[this.current_round].change_one_shape(s)
        }
        else {
            this.rounds[this.current_round].change_one_color(s)
        }
        await new Promise((resolve) => {
            let start_time = performance.now();
            this.rounds[this.current_round].display_buttons(async (clicked_shape) => {
                this.rounds[this.current_round].reaction_time = performance.now() - start_time;
                await this.button_functionality(clicked_shape);
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

    averageReactionTime() {
        let tot = 0
        for (const round of this.rounds){
            tot += round.reaction_time;
        }
        return tot/this.rounds.length
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