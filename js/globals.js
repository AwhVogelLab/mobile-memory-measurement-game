//For holding links to the files
export const shape_folder = "/shapes_updated/";
export const image_folders = ["circle", "cog", "crescent", "horizontal", 
                        "square", "triangle", "vertical_rectangle", "x"];
export const colors = ["black", "blue", "cyan", "green", "magenta", 
                "orange", "red", "white", "yellow"];

//creating a cache for images
export const imageCache = new Map();

//create canvas object
export const canvas = document.getElementById("myCanvas");
export let canvas_size = Math.min(window.innerHeight - 344, window.innerWidth - 100);
canvas.width = canvas_size;
canvas.height = canvas_size;
export const ctx = canvas.getContext("2d");

//create audio holder
export const audioContext = new AudioContext();
export const sounds = new Map();

export let img_size = 0.2 * canvas_size;

//pauses for specified ms
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function distance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2))
}