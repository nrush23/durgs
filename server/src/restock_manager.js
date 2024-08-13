import { Restocker } from "./functionality/restocker.js";
import { Item_Manager } from "./item_manager.js";

export class Restock_Manager {
    //For managing the ingredient pools
    top_bun;
    bottom_bun;
    lettuce;
    tomato;
    patty;
    tray;

    //For making sure restocks can only be pressed once every second
    timer = 0;
    restocker;
    constructor(scene) {
        this.top_bun = new Item_Manager("top_bun");
        this.bottom_bun = new Item_Manager("bottom_bun");
        this.lettuce = new Item_Manager("lettuce");
        this.tomato = new Item_Manager("tomato");
        this.patty = new Item_Manager("patty");
        this.tray = new Item_Manager("tray");
        this.restocker = new Restocker(scene);
    }

    restock(item) {
        if (this.timer > 0) {
            return null;
        } else {
            let pool = [];
            switch (item) {
                case "top_bun":
                    pool = this.top_bun.getPool();
                    break;
                case "bottom_bun":
                    pool = this.bottom_bun.getPool();
                    break;
                case "lettuce":
                    pool = this.lettuce.getPool();
                    break;
                case "tomato":
                    pool = this.tomato.getPool();
                    break;
                case "patty":
                    pool = this.patty.getPool();
                    break;
                case "tray":
                    pool = this.tray.getPool();
                default:
                    console.log("Error: Invalid restock %s", item);
                    return null;
            }
            this.restocker.platform.spawnIngredient(item, pool);
            return pool;
        }
    }

}