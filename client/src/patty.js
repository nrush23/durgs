import { SceneLoader, MultiMaterial, SubMesh, TransformNode, Vector3, PhysicsShapeBox, PhysicsBody, PhysicsMotionType, Quaternion } from "@babylonjs/core";
import { Food, cook_state } from "./food";

export class Patty extends Food {

    constructor(scene, position, name) {
        super(scene);
        SceneLoader.ImportMesh("patty", "", "./assets/burger_test2.glb", scene, (meshes) => {
            if (meshes.length > 0) {
                // this.joint_distance = 0.09/2;
                this.createBody(meshes, position, name);
            }
        });
        this.doneness = cook_state.raw;
        // this.joint_distance = 0.05;
    }

    cook() {
        this.cook_time += .1;
        if (this.cook_time > 0.3) {
            this.doneness = cook_state.perfect;
        } else if (this.cook_time > 0.6) {
            this.doneness = cook_state.burnt;
        }
        this.OVERLAY.alpha = this.cook_time;
    }
}