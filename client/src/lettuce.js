import { Food, cook_state} from "./food";
import { SceneLoader } from "@babylonjs/core";

export class Lettuce extends Food{
    constructor(scene, position){
        super(scene);
        SceneLoader.ImportMesh("lettuce", "", "./assets/burger.glb", scene, (meshes) => {
            if (meshes.length > 0) {
                this.model = meshes[0];
                console.log("lettuce:",this.model);
                this.model.position = position;
                this.model.isPickable = false;
                this.model.enablePointerMoveEvents = false;
                this.model.name = "lettuce";
                this.model.metadata = { classInstance: this };
                console.log("lettuce:",meshes);
            }
        });
        this.doneness = cook_state.perfect;
    }

    cook(){
        if(this.cook_time > 0.5){
            this.doneness = burnt;
        }
    }
}