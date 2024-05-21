import { Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import { Food, cook_state } from "./food";

export class Bun extends Food {
    top;
    //Construct food items with their spawn position
    constructor(scene, top, position) {
        super(scene);
        this.top = top;
        let bun = (this.top) ? "top_bun" : "bottom_bun";
        SceneLoader.ImportMesh(bun, "", "./assets/burger.glb", scene, (meshes) => {
            if (meshes.length > 0) {
                this.model = meshes[0];
                this.model.position = position;
            }
        });
        this.doneness = cook_state.perfect;
    }

    cook() {
        this.doneness = (this.cook_time > 0.3)? cook_state.burnt : cook_state.perfect;
    }
}