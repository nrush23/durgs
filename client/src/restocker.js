import { Restock_Icon } from "./restock_icon";
import { Restock_Platform } from "./restock_platform";

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
            this.icons[i].action = (item) => {
                this.platform.spawnIngredient(ingredients[i]);
            }
            // const mesh = scene.getMeshByName("restock_")
            // const mesh_name = "restock_" + ingredients[i];
            // console.log(mesh_name);
            // console.log(scene.getMeshByName(mesh_name));
            this.icons[i].setModel(scene.getMeshByName("restock_" + ingredients[i]));
        }
    }
}