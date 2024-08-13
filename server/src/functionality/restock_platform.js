import { Vector3 } from "@babylonjs/core";
import { Bun } from "./bun.js";
import { Tomato } from "./tomato.js";
import { Lettuce } from "./lettuce.js";
import { Patty } from "./patty.js";

export class Restock_Platform {
    model;
    scene;
    platform;
    dumpster;
    constructor(scene) {
        this.scene = scene;
        this.model = scene.getMeshByName("stock_platform");
        this.platform = this.model.position.clone();
    }
 
    //When physics is implemented, these will just fall from the sky
    //and we won't need to worry about tracking the top
    spawnIngredient(item, pool) {
        let type;
        switch (item) {
            case "top_bun":
            case "bottom_bun":
                type = Bun;
                break;
            case "tomato":
                type = Tomato;
                break;
            case "lettuce":
                type = Lettuce;
                break;
            case "patty":
                type = Patty;
                break;
            default:
                console.log("Invalid ingredient requested");
                break;
        }

        for(let i = 0; i < 5; i++){
            let check = this.scene.getMeshByName(item + pool[i]);
            if(check){
                check.dispose();
            }
            let position = this.platform.clone();
            position.x *= -1;
            if(type == Bun){
                check = new type(this.scene, (item == 'top_bun')?true:false, position, item + pool[i]);
            }else{
                check = new type(this.scene, position, item + pool[i]);
            }
            this.platform.y += 0.2;
            console.log("%s: %s",item+pool[i],position);
        }
    }
    
}