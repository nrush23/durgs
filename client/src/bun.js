import { StandardMaterial, Color3, SubMesh, TransformNode, PhysicsViewer, MultiMaterial, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeBox, PhysicsShapeType, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import { Food, cook_state } from "./food";

export class Bun extends Food {
    top;
    //Construct food items with their spawn position
    constructor(scene, top, position, name) {
        super(scene);
        this.top = top;
        let bun = (this.top) ? "top_bun" : "bottom_bun";
        SceneLoader.ImportMesh(bun, "", "./assets/burger_test2.glb", scene, (meshes) => {
            if (meshes.length > 0) {
                this.createBody(meshes, position, name);
            }
        });
        this.doneness = cook_state.perfect;
        // this.joint_distance = (!top) ? 0.142 : 0.175;
    }

    cook() {
        this.cook_time += .1;
        this.doneness = (this.cook_time > 0.3) ? cook_state.burnt : cook_state.perfect;
        this.OVERLAY.alpha = (this.cook_time < 1) ? this.cook_time : 1;
    }
}