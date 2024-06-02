import { Vector3 } from "@babylonjs/core";
import { Bun } from "./bun";
import { Tomato } from "./tomato";
import { Lettuce } from "./lettuce";
import { Patty } from "./patty";

export class Restock_Platform {
    model;
    scene;
    top;
    constructor(scene) {
        this.scene = scene;
        this.model = scene.getMeshByName("stock_platform");
        this.top = this.model.position;
        console.log(this.top);
    }
 
    //When physics is implemented, these will just fall from the sky
    //and we won't need to worry about tracking the top
    spawnIngredient(item) {
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

        // let position = this.model.position;
        // let position = new Vector3(this.model.position._x, this.model.position._y, this.model.position._z);
        let position = new Vector3(-1*this.top._x, this.top._y, this.top._z);
        for(let i = 0; i < 5; i++){
            if(type == Bun){
                new type(this.scene, (item)?true:false, position);
            }else{
                new type(this.scene, position);
            }
            position.y += 0.02;
            // top._y += 0.2;
        }
        this.top._y = position.y;
    }
    
}