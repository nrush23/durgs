import { SceneLoader } from "@babylonjs/core";
import { Food, cook_state } from "./food";

export class Patty extends Food{

    constructor(scene, position){
        super(scene);
        SceneLoader.ImportMesh("patty", "", "./assets/burger.glb", scene, (meshes) => {
            if (meshes.length > 0) {
                this.model = meshes[0];
                console.log("patty:",this.model);
                this.model.position = position;
                this.model.isPickable = false;
                this.model.enablePointerMoveEvents = false;
                this.model.name = "patty";
                this.model.metadata = { classInstance: this };
                console.log("patty:",meshes);
            }
        });
        this.doneness = cook_state.raw;
    }

    cook(){
        if(this.cook_time > 0.3){
            this.doneness = cook_state.perfect;
        }else if(this.cook_time > 0.6){
            this.doneness = cook_state.burnt;
        }
    }
}