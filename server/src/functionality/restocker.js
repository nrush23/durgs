import { Restock_Icon } from "./restock_icon.js";
import { Restock_Platform } from "./restock_platform.js";

const ingredients = ["top_bun", "bottom_bun", "lettuce", "patty", "tomato"];

export class Restocker{
    icons = [];
    scene;
    platform;
    constructor(scene){
        this.scene = scene;
        this.platform = new Restock_Platform(scene);
        for(let i = 0; i < ingredients.length; i++){
            this.icons[i] = new Restock_Icon(scene, ingredients[i], this.platform);
            this.icons[i].setModel(scene.getMeshByName("restock_" + ingredients[i]));
        }
    }
}