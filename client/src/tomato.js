import { Food, cook_state } from "./food";
import { SceneLoader } from "@babylonjs/core";
export class Tomato extends Food {
    constructor(scene, position){
        super(scene);
        SceneLoader.ImportMesh("tomato", "", "./assets/burger.glb", scene, (meshes) => {
            if (meshes.length > 0) {
                this.model = meshes[0];
                console.log("tomato:",this.model);
                this.model.position = position;
                this.model.isPickable = false;
                this.model.enablePointerMoveEvents = false;
                this.model.name = "tomato";
                this.model.metadata = { classInstance: this };
                console.log("tomato:",meshes);
            }
        });
        this.doneness = cook_state.perfect;
    }

    cook(){
        if(this.cook_time > 0.5){
            this.doneness = cook_state.burnt;
        }
    }
}